import React from 'react';
import PaddleAngleVisualizer from '../components/learning/visuals/PaddleAngleVisualizer';
import TrajectoryVisualizer from '../components/learning/visuals/TrajectoryVisualizer';
import CourtPositionVisualizer from '../components/learning/visuals/CourtPositionVisualizer';

export interface Lesson {
    id: string;
    title: string;
    description: string;
    duration: string;
    completed: boolean;
    keyPoints?: string[];
    content?: React.ReactNode;
}

export interface LearningPath {
    id: string;
    level: string;
    icon: string;
    color: string;
    gradient: string;
    description: string;
    lessons: Lesson[];
    totalDuration: string;
    storyIntro: string;
}

export const learningPaths: LearningPath[] = [
    {
        id: 'beginner',
        level: '新手入門',
        icon: '🌱',
        color: 'emerald',
        gradient: 'from-emerald-500 to-teal-600',
        description: '從零開始，帶你認識並愛上匹克球',
        storyIntro: '歡迎來到匹克球的世界！讓我們一步步了解這項有趣的運動，從認識開始，到能夠自信地上場比賽。',
        totalDuration: '6 週',
        lessons: [
            {
                id: 'b1',
                title: '第一章：認識匹克球',
                description: '匹克球是什麼？為什麼全球都在瘋這項運動？',
                duration: '20 分鐘',
                completed: false,
                keyPoints: [
                    '匹克球的起源與發展',
                    '為什麼匹克球適合所有年齡層',
                    '匹克球 vs 網球、羽球的差異',
                    '在台灣哪裡可以打匹克球',
                ],
            },
            {
                id: 'b2',
                title: '第二章：球場與裝備',
                description: '了解球場結構、需要準備什麼裝備',
                duration: '30 分鐘',
                completed: false,
                keyPoints: [
                    '球場尺寸與區域劃分（廚房區、發球區）',
                    '如何選擇第一支球拍',
                    '匹克球的特性與選擇',
                    '服裝與鞋子建議',
                ],
            },
            {
                id: 'b3',
                title: '第三章：基本規則',
                description: '掌握比賽規則，才能開始打球',
                duration: '45 分鐘',
                completed: false,
                keyPoints: [
                    '計分方式（只有發球方能得分）',
                    '發球規則（下手發球、對角發球）',
                    '雙跳規則（Two-Bounce Rule）',
                    '廚房規則（Non-Volley Zone）',
                    '界內界外判定',
                ],
            },
            {
                id: 'b4',
                title: '第四章：握拍與準備姿勢',
                description: '正確的握拍是成功的第一步',
                duration: '40 分鐘',
                completed: false,
                keyPoints: [
                    '三種基本握法（東方式、大陸式、西方式）',
                    '準備姿勢（Ready Position）',
                    '基本站位與重心',
                    '常見握拍錯誤',
                ],
                content: (
                    <div className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-bold text-blue-900 mb-2">為什麼球總是飛太高？</h4>
                            <p className="text-blue-800 mb-4">
                                很多新手會發現自己回擊的球總是飛得很高，給對方殺球的機會。這通常是因為你的球拍角度太過「開放」（拍面朝上）。
                                使用下方的模擬器來看看球拍角度如何影響球的飛行軌跡。
                            </p>
                            <PaddleAngleVisualizer />
                        </div>
                    </div>
                )
            },
            {
                id: 'b5',
                title: '第五章：發球技巧',
                description: '學會發球，就能開始比賽了',
                duration: '1 小時',
                completed: false,
                keyPoints: [
                    '下手發球動作分解',
                    '發球站位與瞄準',
                    '如何發出穩定的發球',
                    '發球常見錯誤與修正',
                ],
            },
            {
                id: 'b6',
                title: '第六章：接發球與回球',
                description: '學會接球，就能開始對打',
                duration: '1 小時',
                completed: false,
                keyPoints: [
                    '接發球準備姿勢',
                    '深回球技巧',
                    '如何應對不同的來球',
                    '回球的落點選擇',
                ],
            },
            {
                id: 'b7',
                title: '第七章：基本擊球技術',
                description: '掌握正手、反手、截擊三大基本擊球',
                duration: '1.5 小時',
                completed: false,
                keyPoints: [
                    '正手擊球（Forehand）',
                    '反手擊球（Backhand）',
                    '截擊（Volley）',
                    '高吊球（Lob）',
                ],
                content: (
                    <div className="space-y-6">
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h4 className="font-bold text-purple-900 mb-2">認識不同的球路</h4>
                            <p className="text-purple-800 mb-4">
                                匹克球不只是用力打。學會區分「丁克球」、「抽球」和「高吊球」的使用時機，是進步的關鍵。
                            </p>
                            <TrajectoryVisualizer />
                        </div>
                    </div>
                )
            },
            {
                id: 'b8',
                title: '第八章：移動與步法',
                description: '學會移動，才能打到每一球',
                duration: '1 小時',
                completed: false,
                keyPoints: [
                    '基本移動步法',
                    '側併步與交叉步',
                    '回位觀念',
                    '如何預判球的落點',
                ],
            },
            {
                id: 'b9',
                title: '第九章：球場禮儀與安全',
                description: '成為受歡迎的球友',
                duration: '30 分鐘',
                completed: false,
                keyPoints: [
                    '球場基本禮儀',
                    '如何呼叫界內界外',
                    '安全注意事項',
                    '如何找球友與加入社群',
                ],
            },
            {
                id: 'b10',
                title: '第十章：第一場比賽',
                description: '準備好了！上場試試看',
                duration: '1 小時',
                completed: false,
                keyPoints: [
                    '比賽前的準備',
                    '如何報分數',
                    '雙打基本配合',
                    '享受比賽，不要怕犯錯',
                ],
            },
        ],
    },
    {
        id: 'intermediate',
        level: '中階進修',
        icon: '⚡',
        color: 'blue',
        gradient: 'from-blue-500 to-indigo-600',
        description: '提升技術，成為更有競爭力的球員',
        storyIntro: '你已經掌握基礎了！現在讓我們深入學習進階技巧，提升你的比賽水平。',
        totalDuration: '8 週',
        lessons: [
            {
                id: 'i1',
                title: '進階擊球技巧',
                description: '學習切球、旋轉球、小球等進階技術',
                duration: '2 小時',
                completed: false,
                keyPoints: [
                    '切球（Slice）技巧',
                    '上旋球（Topspin）',
                    '小球（Dink）精進',
                    '快速抽球（Drive）',
                ],
            },
            {
                id: 'i2',
                title: '第三球小球策略',
                description: '掌握匹克球最重要的戰術',
                duration: '1.5 小時',
                completed: false,
                keyPoints: [
                    '什麼是第三球小球',
                    '為什麼第三球很重要',
                    '如何練習第三球',
                    '第三球的變化',
                ],
                content: (
                    <div className="space-y-6">
                        <div className="bg-indigo-50 p-4 rounded-lg">
                            <h4 className="font-bold text-indigo-900 mb-2">第三球與上網時機</h4>
                            <p className="text-indigo-800 mb-4">
                                「第三球小球」是匹克球最核心的戰術。它能讓你安全地從底線移動到網前。
                                觀察下方的戰術板，了解球員是如何移動的。
                            </p>
                            <CourtPositionVisualizer />
                        </div>
                    </div>
                )
            },
            {
                id: 'i3',
                title: '網前對決技巧',
                description: '在廚房區域的攻防技巧',
                duration: '2 小時',
                completed: false,
                keyPoints: [
                    '小球對拉技巧',
                    '如何製造機會球',
                    '網前截擊時機',
                    '防守高吊球',
                ],
            },
            {
                id: 'i4',
                title: '雙打站位與配合',
                description: '培養雙打默契與戰術',
                duration: '2 小時',
                completed: false,
                keyPoints: [
                    '雙打基本站位',
                    '進攻與防守陣型',
                    '與搭檔的溝通',
                    '如何補位',
                ],
            },
            {
                id: 'i5',
                title: '常見錯誤診斷與修正',
                description: '找出並改善技術問題',
                duration: '1.5 小時',
                completed: false,
                keyPoints: [
                    '擊球不穩定的原因',
                    '移動不到位的問題',
                    '發球失誤分析',
                    '心理因素影響',
                ],
            },
        ],
    },
    {
        id: 'advanced',
        level: '進階強化',
        icon: '🏆',
        color: 'purple',
        gradient: 'from-purple-500 to-pink-600',
        description: '追求卓越，準備參加比賽',
        storyIntro: '你已經是一位優秀的球員了！讓我們精進每個細節，準備在比賽中大放異彩。',
        totalDuration: '10 週',
        lessons: [
            {
                id: 'a1',
                title: '專業技術細節優化',
                description: '精進每個技術動作的細節',
                duration: '2.5 小時',
                completed: false,
                keyPoints: [
                    '擊球一致性訓練',
                    '旋轉控制',
                    '落點精準度',
                    '速度與力量平衡',
                ],
            },
            {
                id: 'a2',
                title: '高階戰術運用',
                description: '學習職業選手的戰術思維',
                duration: '2 小時',
                completed: false,
                keyPoints: [
                    '如何分析對手',
                    '戰術變化與調整',
                    '壓力下的決策',
                    '比賽節奏控制',
                ],
            },
            {
                id: 'a3',
                title: '比賽心理與心態',
                description: '培養冠軍心態',
                duration: '2 小時',
                completed: false,
                keyPoints: [
                    '壓力管理技巧',
                    '專注力訓練',
                    '如何面對失誤',
                    '比賽前的心理準備',
                ],
            },
            {
                id: 'a4',
                title: '體能訓練與傷害預防',
                description: '保持最佳狀態',
                duration: '2 小時',
                completed: false,
                keyPoints: [
                    '匹克球專項體能',
                    '熱身與拉伸',
                    '常見運動傷害預防',
                    '恢復與休息',
                ],
            },
            {
                id: 'a5',
                title: '教練培訓與教學',
                description: '成為教練，傳承技術',
                duration: '3 小時',
                completed: false,
                keyPoints: [
                    '教學方法與技巧',
                    '如何設計訓練計劃',
                    '錯誤診斷與修正',
                    '激勵與溝通',
                ],
            },
        ],
    },
];
