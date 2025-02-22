const StatsRoll = ({ stats }) => {
  return (
    <div className="w-full bg-orange-600 text-white whitespace-nowrap overflow-hidden">
      <div className="animate-roll w-full py-3 flex items-center justify-center capitalize font-semibold tracking-wider text-base">
        {stats?.map((stat) => (
          <div key={stat}>
            {stat} <span className="px-4"> | </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatsRoll;
