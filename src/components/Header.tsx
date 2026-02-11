const Header = () => {
    return (
        <header className="pt-12 pb-8 px-6 bg-white text-center">
            <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                    <div className="w-12 h-1 bg-slate-200 rounded-full" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <div className="w-12 h-1 bg-slate-200 rounded-full" />
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                </div>
            </div>

            <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-3">
                퇴근까지 <span className="text-blue-600">N정거장</span>
            </h1>

            <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed max-w-xs mx-auto">
                직장 30분 거리 역은 어디일까? <br />
                <span className="text-slate-800">정거장 수로 찾는 최적의 거주지 탐색기</span>
            </p>


        </header>
    );
};

export default Header;