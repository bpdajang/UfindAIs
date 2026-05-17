import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { AuthContext } from "../context/AuthContext";
import useSavedStatus from "../hooks/useSavedStatus";

const AICard = ({ tool }) => {
  const { token } = useContext(AuthContext);

  const [imageError, setImageError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { isSaved, setIsSaved } = useSavedStatus({ token, toolId: tool?.id });

  // Get pricing badge color
  const getPricingColor = (pricing) => {
    switch (pricing?.toLowerCase()) {
      case "free":
        return "bg-green-500/20 text-green-400";
      case "freemium":
        return "bg-blue-500/20 text-blue-400";
      case "free trial":
        return "bg-purple-500/20 text-purple-400";
      case "paid":
        return "bg-orange-500/20 text-orange-400";
      default:
        return "bg-gray-500/20 text-gray-400";
    }
  };

  const handleSaveClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      window.location.href = "/login";
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      const res = await fetch(`/api/users/me/saved/${tool.id}`, {
        method: isSaved ? "DELETE" : "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Failed to update save");
      }

      setIsSaved(!isSaved);
    } catch {
      // revert visual state by re-syncing from hook
      setIsSaved(isSaved);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="rounded-2xl overflow-hidden hover:border-indigo-500/50 transition duration-300"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-color)",
      }}
    >
      {/* Clickable area leading to AIDetails */}
      <Link to={`/ai/${tool.id}`} className="block">
        {/* Logo Section */}
        <div className="p-6 pb-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="p-3 rounded-xl w-14 h-14 flex items-center justify-center"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              >
                {!imageError && tool.logo ? (
                  <img
                    src={tool.logo}
                    alt={tool.name}
                    className="w-10 h-10 object-contain"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <span className="text-xl font-bold text-indigo-500">
                    {tool.name?.charAt(0)}
                  </span>
                )}
              </div>

              <h3
                className="text-lg font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                {tool.name}
              </h3>
              {tool.pricing && (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${getPricingColor(tool.pricing)}`}
                >
                  {tool.pricing}
                </span>
              )}
            </div>

            {/* Saves count - Clickable */}
            <button
              onClick={handleSaveClick}
              className={`flex items-center gap-1 text-sm transition `}
            >
              <Bookmark
                className={
                  isSaved
                    ? "text-indigo-500 fill-indigo-500"
                    : "text-gray-400 hover:text-indigo-400"
                }
                fill={isSaved ? "currentColor" : "none"}
              />
            </button>
          </div>
        </div>

        {/* Name and Pricing */}
        <div className="px-6 pb-3">
          {/* Short Description
          <p
            className="text-sm line-clamp-2 mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            {tool.description}
          </p> */}

          {/* Functions/Tags */}
          {tool.functions && tool.functions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tool.functions.slice(0, 3).map((func, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 rounded-box"
                  style={{
                    color: "var(--text-secondary)",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  {func}
                </span>
              ))}
              {tool.functions.length > 3 && (
                <span
                  className="text-xs px-2 py-1 rounded-box"
                  style={{
                    color: "var(--text-muted)",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  +{tool.functions.length - 3}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      {/* Visit Button - Not clickable, separate from the Link
      <div className="p-6 pt-4">
        <a
          href={tool.website}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full border border-indigo-500 hover:bg-indigo-500 py-2.5 rounded-lg text-center transition font-medium"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          Visit
        </a>
      </div> */}
    </div>
  );
};

export default AICard;
