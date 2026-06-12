import { useState } from "react";
import { Link } from "react-router";
import { Clock, ChevronRight, Search } from "lucide-react";
import { blogPosts } from "../data/products";
const allCategories = ["T\u1EA5t c\u1EA3", ...Array.from(new Set(blogPosts.map((p) => p.category)))];
function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("T\u1EA5t c\u1EA3");
  const [query, setQuery] = useState("");
  const filtered = blogPosts.filter((p) => {
    const matchCat = activeCategory === "T\u1EA5t c\u1EA3" || p.category === activeCategory;
    const matchQ = !query || p.title.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });
  const featured = blogPosts[0];
  return <div className="max-w-7xl mx-auto px-4 py-5">
      {
    /* Breadcrumb */
  }
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-700">Trang chủ</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800">Góc sức khỏe</span>
      </nav>

      {
    /* Featured post */
  }
      <Link to={`/blog/${featured.slug}`} className="group relative rounded-2xl overflow-hidden mb-8 block" style={{ height: "340px" }}>
        <img src={featured.image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, transparent 100%)" }} />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <span className="text-xs font-semibold px-3 py-1 rounded-full text-white mb-3 inline-block" style={{ backgroundColor: "#1250dc" }}>
            {featured.category}
          </span>
          <h2 className="text-white font-bold mb-2 group-hover:text-blue-200 transition-colors" style={{ fontSize: "1.5rem", lineHeight: 1.3 }}>{featured.title}</h2>
          <p className="text-white/80 text-sm line-clamp-2 mb-3">{featured.excerpt}</p>
          <div className="flex items-center gap-3 text-white/70 text-xs">
            <img src={featured.authorAvatar} alt="" className="w-6 h-6 rounded-full object-cover" />
            <span>{featured.author}</span>
            <span>·</span>
            <Clock size={12} />
            <span>{featured.readTime} phút đọc</span>
            <span>·</span>
            <span>{new Date(featured.date).toLocaleDateString("vi-VN")}</span>
          </div>
        </div>
      </Link>

      {
    /* Filters */
  }
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {allCategories.map((cat) => <button
    key={cat}
    onClick={() => setActiveCategory(cat)}
    className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? "text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}
    style={activeCategory === cat ? { backgroundColor: "#1250dc" } : {}}
  >
              {cat}
            </button>)}
        </div>
        <div className="relative md:ml-auto">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
    type="text"
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    placeholder="Tìm bài viết..."
    className="w-full md:w-64 pl-9 pr-4 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-400 bg-white"
  />
        </div>
      </div>

      {
    /* Articles grid */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.slice(1).map((post) => <Link key={post.id} to={`/blog/${post.slug}`} className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-shadow border border-gray-100">
            <div className="overflow-hidden">
              <img src={post.image} alt={post.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "#e8efff", color: "#1250dc" }}>{post.category}</span>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={11} />
                  <span>{post.readTime} phút</span>
                </div>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2 leading-snug group-hover:text-blue-700 transition-colors" style={{ fontSize: "0.95rem" }}>{post.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-3 mb-4">{post.excerpt}</p>
              <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
                <img src={post.authorAvatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                <div>
                  <div className="text-xs font-medium text-gray-700">{post.author}</div>
                  <div className="text-xs text-gray-400">{new Date(post.date).toLocaleDateString("vi-VN")}</div>
                </div>
              </div>
            </div>
          </Link>)}
      </div>

      {filtered.length === 0 && <div className="text-center py-16 text-gray-500">
          <Search size={40} className="mx-auto mb-3 text-gray-300" />
          <div className="font-medium text-gray-700 mb-1">Không tìm thấy bài viết</div>
          <div className="text-sm">Thử tìm kiếm với từ khóa khác</div>
        </div>}
    </div>;
}
export {
  BlogPage as default
};
