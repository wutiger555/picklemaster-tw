import Foundation
import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import AppKit

// 遊戲角色素材萃取（macOS，需要 Vision 框架；全部在本機執行，不上傳任何照片）
//
// 用法：
//   sips -s format jpeg <照片.heic> --out /tmp/in.jpg        # HEIC 先轉 JPEG
//   swiftc -O scripts/extract-character.swift -o /tmp/extract
//   /tmp/extract /tmp/in.jpg /tmp/out/name                   # 輸出到 /tmp/out/name-<n>-*.png
//   cwebp -q 80 -alpha_q 85 name-0-portrait.png -o public/game/characters/<id>-portrait.webp
//   cwebp -q 85 -alpha_q 90 name-0-face.png -o public/game/characters/<id>-face.webp
// 然後在 src/components/game/characters.ts 新增一筆（顏色可參考 stdout 的取樣值）。
// 放上公開網站前，務必取得照片中當事人的同意。輸出的 PNG 不含原照片的 EXIF／GPS。
//
// 偵測臉（只取主角：臉面積 ≥ 最大臉的 35%）、前景實例去背、輸出：
//   <prefix>-<n>-portrait.png  去背半身像（選角卡）
//   <prefix>-<n>-face.png      臉部方形貼圖＋柔邊橢圓遮罩（貼 3D 頭）
//   並在 stdout 印出 JSON：臉框、膚色、髮色、衣服色

let args = CommandLine.arguments
guard args.count >= 3 else { print("usage"); exit(1) }
let inURL = URL(fileURLWithPath: args[1])
let prefix = args[2]
let ctx = CIContext(options: [.useSoftwareRenderer: false])

guard let src = CIImage(contentsOf: inURL), let cg = ctx.createCGImage(src, from: src.extent) else { print("load fail"); exit(1) }
let W = CGFloat(cg.width), H = CGFloat(cg.height)

// 臉部偵測（含特徵點）
let faceReq = VNDetectFaceLandmarksRequest()
let handler = VNImageRequestHandler(cgImage: cg, options: [:])
try handler.perform([faceReq])
let faces = (faceReq.results ?? []).sorted { $0.boundingBox.width * $0.boundingBox.height > $1.boundingBox.width * $1.boundingBox.height }
guard let biggest = faces.first else { print("{\"faces\":[]}"); exit(0) }
let maxArea = biggest.boundingBox.width * biggest.boundingBox.height
let mains = faces.filter { $0.boundingBox.width * $0.boundingBox.height >= maxArea * 0.35 }

// 人物實例分割：自拍裡的兩個人會被分開（前景分割會把貼在一起的人當成一體）
let personReq = VNGeneratePersonInstanceMaskRequest()
try handler.perform([personReq])
let fg = personReq.results?.first

func pixelRect(_ r: CGRect) -> CGRect {
  // Vision 正規化座標（左下原點）→ CoreImage 像素座標（也是左下原點）
  CGRect(x: r.minX * W, y: r.minY * H, width: r.width * W, height: r.height * H)
}

func average(_ img: CIImage, _ rect: CGRect) -> [Int] {
  let r = rect.intersection(img.extent)
  if r.isEmpty { return [0, 0, 0] }
  let f = CIFilter.areaAverage()
  f.inputImage = img
  f.extent = r
  var px = [UInt8](repeating: 0, count: 4)
  ctx.render(f.outputImage!, toBitmap: &px, rowBytes: 4, bounds: CGRect(x: 0, y: 0, width: 1, height: 1), format: .RGBA8, colorSpace: CGColorSpaceCreateDeviceRGB())
  return [Int(px[0]), Int(px[1]), Int(px[2])]
}

func savePNG(_ img: CIImage, _ path: String) {
  let rep = NSBitmapImageRep(cgImage: ctx.createCGImage(img, from: img.extent)!)
  try! rep.representation(using: .png, properties: [:])!.write(to: URL(fileURLWithPath: path))
}

var out: [[String: Any]] = []
for (i, face) in mains.enumerated() {
  let fr = pixelRect(face.boundingBox)
  let cx = fr.midX, cy = fr.midY
  // 用兩眼中心算頭的傾斜角（比 Vision 的 roll 精確），之後整張圖轉正再裁
  var angle: CGFloat = 0
  if let le = face.landmarks?.leftEye, let re = face.landmarks?.rightEye {
    func center(_ r: VNFaceLandmarkRegion2D) -> CGPoint {
      let pts = r.pointsInImage(imageSize: CGSize(width: W, height: H))
      let sx = pts.reduce(0) { $0 + $1.x }, sy = pts.reduce(0) { $0 + $1.y }
      return CGPoint(x: sx / CGFloat(pts.count), y: sy / CGFloat(pts.count))
    }
    let a = center(le), b = center(re)
    // Vision 的 leftEye 是人物自己的左眼（畫面右側）
    let (l, r) = a.x < b.x ? (a, b) : (b, a)
    angle = atan2(r.y - l.y, r.x - l.x)
  }
  let upright = CGAffineTransform(translationX: -cx, y: -cy).concatenating(CGAffineTransform(rotationAngle: -angle)).concatenating(CGAffineTransform(translationX: cx, y: cy))
  let srcUp = src.transformed(by: upright)

  // 找出包含這張臉中心的前景實例
  var personImg: CIImage = src
  if let fg = fg {
    let maskBuf = fg.instanceMask
    CVPixelBufferLockBaseAddress(maskBuf, .readOnly)
    let mw = CVPixelBufferGetWidth(maskBuf), mh = CVPixelBufferGetHeight(maskBuf)
    let row = CVPixelBufferGetBytesPerRow(maskBuf)
    let base = CVPixelBufferGetBaseAddress(maskBuf)!.assumingMemoryBound(to: UInt8.self)
    // 遮罩是左上原點
    let mx = min(mw - 1, max(0, Int(cx / W * CGFloat(mw))))
    let my = min(mh - 1, max(0, Int((1 - cy / H) * CGFloat(mh))))
    let inst = Int(base[my * row + mx])
    CVPixelBufferUnlockBaseAddress(maskBuf, .readOnly)
    if inst > 0, let maskPB = try? fg.generateScaledMaskForImage(forInstances: IndexSet(integer: inst), from: handler) {
      // 遮罩整理：閉運算補小洞（張嘴、眼鏡反光）＋提高對比去掉半透明殘影
      var m = CIImage(cvPixelBuffer: maskPB)
      let dil = CIFilter.morphologyMaximum(); dil.inputImage = m; dil.radius = 9; m = dil.outputImage!.cropped(to: src.extent)
      let ero = CIFilter.morphologyMinimum(); ero.inputImage = m; ero.radius = 9; m = ero.outputImage!.cropped(to: src.extent)
      let cm = CIFilter.colorMatrix()
      cm.inputImage = m
      cm.rVector = CIVector(x: 1.6, y: 0, z: 0, w: 0)
      cm.gVector = CIVector(x: 0, y: 1.6, z: 0, w: 0)
      cm.bVector = CIVector(x: 0, y: 0, z: 1.6, w: 0)
      cm.biasVector = CIVector(x: -0.3, y: -0.3, z: -0.3, w: 0)
      let clamp = CIFilter.colorClamp(); clamp.inputImage = cm.outputImage; m = clamp.outputImage!
      // 頭部一定保留：和「以臉為中心的橢圓」取聯集（人物遮罩常把張開的嘴、口罩判成背景）
      let fsz = max(fr.width, fr.height)
      let hg = CIFilter.radialGradient()
      hg.center = CGPoint(x: 0, y: 0)
      hg.radius0 = Float(fsz * 0.62)
      hg.radius1 = Float(fsz * 0.72)
      hg.color0 = CIColor(red: 1, green: 1, blue: 1, alpha: 1)
      hg.color1 = CIColor(red: 0, green: 0, blue: 0, alpha: 1)
      let head = hg.outputImage!
        .transformed(by: CGAffineTransform(scaleX: 0.82, y: 1.0))
        .transformed(by: CGAffineTransform(rotationAngle: angle))
        .transformed(by: CGAffineTransform(translationX: cx, y: cy + fsz * 0.12))
        .cropped(to: src.extent)
      let un = CIFilter.maximumCompositing(); un.inputImage = m; un.backgroundImage = head; m = un.outputImage!.cropped(to: src.extent)
      // 只留主角附近：以身體為中心的大橢圓外一律淡掉（清掉別人的手、碎片）
      let bg = CIFilter.radialGradient()
      bg.center = CGPoint(x: 0, y: 0)
      bg.radius0 = Float(fsz * 1.35)
      bg.radius1 = Float(fsz * 1.75)
      bg.color0 = CIColor(red: 1, green: 1, blue: 1, alpha: 1)
      bg.color1 = CIColor(red: 0, green: 0, blue: 0, alpha: 1)
      let body = bg.outputImage!
        .transformed(by: CGAffineTransform(scaleX: 1.0, y: 1.4))
        .transformed(by: CGAffineTransform(rotationAngle: angle))
        .transformed(by: CGAffineTransform(translationX: cx, y: cy - fsz * 0.6))
        .cropped(to: src.extent)
      let mul = CIFilter.multiplyCompositing(); mul.inputImage = m; mul.backgroundImage = body; m = mul.outputImage!.cropped(to: src.extent)
      let soft = CIFilter.gaussianBlur(); soft.inputImage = m; soft.radius = 1.5; m = soft.outputImage!.cropped(to: src.extent)
      let bl = CIFilter.blendWithMask()
      bl.inputImage = src
      bl.backgroundImage = CIImage(color: .clear).cropped(to: src.extent)
      bl.maskImage = m
      personImg = bl.outputImage!
    }
  }
  personImg = personImg.transformed(by: upright)

  // 選角卡：頭到胸口的去背半身像
  let fw = fr.width, fh = fr.height
  // 裁切範圍在轉正後的座標系；臉框尺寸用較大邊（Vision 的框會跟著頭歪）
  let fs = max(fw, fh) * 0.92
  let pRect = CGRect(x: cx - fs * 1.6, y: cy - fs * 2.0, width: fs * 3.2, height: fs * 3.35)
  let portrait = personImg.cropped(to: pRect).transformed(by: CGAffineTransform(translationX: -pRect.minX, y: -pRect.minY))
  let pScale = 512 / pRect.width
  savePNG(portrait.transformed(by: CGAffineTransform(scaleX: pScale, y: pScale)), "\(prefix)-\(i)-portrait.png")

  // 臉部貼圖：以臉中心偏上（含額頭、到下巴）裁方形，縮到 256，套柔邊橢圓遮罩
  let side = fs * 1.42
  let fcx = cx, fcy = cy + fs * 0.06
  let fRect = CGRect(x: fcx - side / 2, y: fcy - side / 2, width: side, height: side)
  let faceCrop = srcUp.cropped(to: fRect).transformed(by: CGAffineTransform(translationX: -fRect.minX, y: -fRect.minY))
  let fScale = 256 / side
  let face256 = faceCrop.transformed(by: CGAffineTransform(scaleX: fScale, y: fScale)).cropped(to: CGRect(x: 0, y: 0, width: 256, height: 256))
  let grad = CIFilter.radialGradient()
  grad.center = CGPoint(x: 128, y: 128)
  grad.radius0 = 84
  grad.radius1 = 124
  grad.color0 = CIColor(red: 1, green: 1, blue: 1, alpha: 1)
  grad.color1 = CIColor(red: 1, green: 1, blue: 1, alpha: 0)
  // 橢圓：垂直方向拉長
  let oval = grad.outputImage!.transformed(by: CGAffineTransform(translationX: -128, y: -128).concatenating(CGAffineTransform(scaleX: 0.86, y: 1.0)).concatenating(CGAffineTransform(translationX: 128, y: 128))).cropped(to: CGRect(x: 0, y: 0, width: 256, height: 256))
  let blend = CIFilter.blendWithAlphaMask()
  blend.inputImage = face256
  blend.backgroundImage = CIImage(color: .clear).cropped(to: CGRect(x: 0, y: 0, width: 256, height: 256))
  blend.maskImage = oval
  savePNG(blend.outputImage!, "\(prefix)-\(i)-face.png")

  // 取色：臉頰（膚色）、額頭上方兩側（髮色／帽子）、下巴下方（衣服）
  let skin = average(srcUp, CGRect(x: cx - fs * 0.28, y: cy - fs * 0.18, width: fs * 0.56, height: fs * 0.2))
  let hair = average(srcUp, CGRect(x: cx - fs * 0.35, y: cy + fs * 0.58, width: fs * 0.7, height: fs * 0.16))
  let shirt = average(srcUp, CGRect(x: cx - fs * 0.5, y: cy - fs * 1.75, width: fs * 1.0, height: fs * 0.45))
  out.append([
    "index": i,
    "faceNorm": [face.boundingBox.minX, face.boundingBox.minY, face.boundingBox.width, face.boundingBox.height],
    "angleDeg": Double(angle * 180 / .pi),
    "skin": skin, "hair": hair, "shirt": shirt,
  ])
}
let json = try JSONSerialization.data(withJSONObject: ["image": inURL.lastPathComponent, "allFaces": faces.count, "mains": out], options: [.prettyPrinted])
print(String(data: json, encoding: .utf8)!)
