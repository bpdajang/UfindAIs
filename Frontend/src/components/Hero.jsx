const Hero = () => {
  return (
    <section className="text-center py-20 px-6 bg-gradient-to-b from-gray-900 to-gray-950">
      <h2 className="text-4xl md:text-6xl font-extrabold mb-6">
        Discover the Best AI Tools
        <br />
        for Every Task
      </h2>

      <p className="text-gray-400 max-w-2xl mx-auto mb-8">
        Find powerful AI tools to boost productivity, creativity, and
        automation.
      </p>

      <div className="space-x-4">
        <button className="bg-indigo-600 hover:bg-indigo-500 px-6 py-3 rounded-xl font-semibold transition">
          Explore AIs
        </button>
        <button className="border border-gray-700 hover:border-indigo-500 px-6 py-3 rounded-xl transition">
          Submit an AI
        </button>
      </div>
    </section>
  );
};

export default Hero;
