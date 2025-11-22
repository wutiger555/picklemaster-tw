import VisualSkillCard from './VisualSkillCard';
import PaddleAngleVisualizer from './visuals/PaddleAngleVisualizer';
import TrajectoryVisualizer from './visuals/TrajectoryVisualizer';
import CourtPositionVisualizer from './visuals/CourtPositionVisualizer';
import ATPVisualizer from './visuals/ATPVisualizer';
import ScoringSimulator from './visuals/ScoringSimulator';
import RuleScenarioVisualizer from './visuals/RuleScenarioVisualizer';
import GripVisualization from '../equipment/GripVisualization';
import InteractiveCourt from '../court/InteractiveCourt';
import CourtViewer3D from './CourtViewer3D';

export default function VisualSkillGrid() {
    return (
        <div className="space-y-20">

            {/* Section 1: Mechanics */}
            <section>
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center text-2xl">
                        🛠️
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">擊球機制</h2>
                        <p className="text-gray-500">掌握球拍控制與擊球原理</p>
                    </div>
                </div>

                {/* Mixed Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Full Width Item: Grip Visualization */}
                    <VisualSkillCard
                        title="握拍方式"
                        problem="我該怎麼握球拍？"
                        icon="✊"
                        color="yellow"
                        description="正確的握拍是所有技術的基礎。大陸式握拍是最通用且推薦給新手的握法。"
                        proTip="握拍不要太緊，想像你在握一隻小鳥，太緊會捏死牠，太鬆牠會飛走。放鬆的手腕才能產生鞭打效應。"
                        className="lg:col-span-2"
                    >
                        <GripVisualization />
                    </VisualSkillCard>

                    <VisualSkillCard
                        title="球拍角度控制"
                        problem="為什麼我的球總是飛太高？"
                        icon="📐"
                        color="red"
                        description="球飛太高通常是因為擊球瞬間拍面太過「開放」（朝上）。透過這個模擬器，觀察角度如何影響飛行軌跡。"
                        proTip="試著在擊球瞬間保持拍面垂直於地面，就像在「推」一面牆一樣，這樣能打出強勁的平擊球。"
                    >
                        <PaddleAngleVisualizer />
                    </VisualSkillCard>

                    <VisualSkillCard
                        title="球路軌跡比較"
                        problem="丁克球、抽球、高吊球有什麼不同？"
                        icon="🌈"
                        color="orange"
                        description="不同的擊球方式會產生完全不同的飛行弧線。了解這些差異，才能在正確的時機使用正確的招式。"
                        proTip="丁克球的最高點應該在網子上方，過網後立即下墜；而抽球則要盡量貼網飛行。"
                    >
                        <TrajectoryVisualizer />
                    </VisualSkillCard>
                </div>
            </section>

            {/* Section 2: Tactics */}
            <section>
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl">
                        🧠
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">戰術意識</h2>
                        <p className="text-gray-500">學會像高手一樣思考</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Full Width Item: Court Position */}
                    <VisualSkillCard
                        title="第三球策略"
                        problem="發球後我該做什麼？"
                        icon="🎯"
                        color="blue"
                        description="「第三球小球」是匹克球最核心的戰術。它能讓你安全地從底線移動到網前（廚房線）。"
                        proTip="打完第三球後，不要急著衝，先觀察球的落點。如果球成功進了廚房，再迅速上網。"
                        className="lg:col-span-2"
                    >
                        <CourtPositionVisualizer />
                    </VisualSkillCard>

                    {/* Full Width Item: 3D Court View */}
                    <VisualSkillCard
                        title="球場站位"
                        problem="雙打時我該站哪裡？"
                        icon="📍"
                        color="indigo"
                        description="良好的站位能減少跑動並封鎖對手的進攻路線。了解發球與接發球時的最佳位置。"
                        proTip="隨時跟著球移動。當球在左邊，你和隊友都要稍微往左靠，保持兩人之間的距離不變（像被繩子綁在一起）。"
                        className="lg:col-span-2"
                    >
                        <div className="h-[700px]">
                            <CourtViewer3D />
                        </div>
                    </VisualSkillCard>
                </div>
            </section>

            {/* Section 3: Rules & Scenarios */}
            <section>
                <div className="flex items-center space-x-4 mb-8">
                    <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-2xl">
                        📜
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900">規則與特殊情況</h2>
                        <p className="text-gray-500">搞懂這些，你就是球場上的規則大師</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Full Width Item: Interactive Court Rules */}
                    <VisualSkillCard
                        title="互動式球場規則"
                        problem="什麼是廚房區？什麼是雙彈跳？"
                        icon="🏟️"
                        color="emerald"
                        description="點擊球場的不同區域，直接了解該區域的規則與限制。搞懂最複雜的「廚房規則」。"
                        proTip="記住：你可以在廚房裡打球，但不能在廚房裡「截擊」（球未落地直接打）。"
                        className="lg:col-span-2"
                    >
                        <InteractiveCourt />
                    </VisualSkillCard>

                    <VisualSkillCard
                        title="特殊得分規則"
                        problem="發球打到人算得分嗎？"
                        icon="⚖️"
                        color="purple"
                        description="有些情況雖然少見，但發生時往往會引起爭議。了解「發球打到人」和「身體觸球」的判決。"
                        proTip="如果你站在界外被球打到，還是算你輸！所以看到球要出界了，千萬閃遠一點，不要用手去接。"
                    >
                        <RuleScenarioVisualizer />
                    </VisualSkillCard>

                    <VisualSkillCard
                        title="ATP 繞柱球"
                        problem="球可以從網子旁邊繞過去嗎？"
                        icon="↩️"
                        color="pink"
                        description="這是一種高級技巧！只要球落在界內，即使沒有經過網子上方（而是從網柱外側繞過）也是合法的。"
                        proTip="當對手把你逼到場外大角度時，就是打出 ATP 的最佳時機。瞄準對手場地的空檔，大膽繞過網柱吧！"
                    >
                        <ATPVisualizer />
                    </VisualSkillCard>

                    <VisualSkillCard
                        title="計分規則模擬"
                        problem="10-10 平手時要打到幾分？"
                        icon="🔢"
                        color="cyan"
                        description="匹克球採用「連得兩分 (Win by 2)」規則。這意味著你不能只贏一分就結束比賽。"
                        proTip="在平手 (Deuce) 的高壓情況下，穩健比冒險更重要。等待對手失誤往往比強行進攻更有效。"
                    >
                        <ScoringSimulator />
                    </VisualSkillCard>
                </div>
            </section>

        </div>
    );
}
