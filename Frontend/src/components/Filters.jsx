const categories = [
  "All",
  "Writing",
  "Coding",
  "Design",
  "Video",
  "Marketing",
  "Productivity",
];

const Filters = ({ search, setSearch, selected, setSelected }) => {
  return (
    <div className="px-6 py-8">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Search AI tools..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-4 py-2 w-full md:w-80 focus:outline-none focus:border-indigo-500"
        />

        <div className="flex flex-wrap gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelected(cat)}
              className={`px-4 py-2 rounded-lg text-sm transition hover:bg-gray-700 ${
                selected === cat ? "bg-indigo-600" : "bg-gray-800"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Filters;
