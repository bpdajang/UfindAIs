import AICard from "./AICard";

const AIToolsGrid = ({ tools }) => {
  return (
    <div className="px-6 pb-20">
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tools.map((tool) => (
          <AICard key={tool.id} tool={tool} />
        ))}
      </div>
    </div>
  );
};

export default AIToolsGrid;
