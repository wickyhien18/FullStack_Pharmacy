import { useParams, Link } from "react-router";
import { Clock, ChevronRight, Tag, ArrowLeft } from "lucide-react";
import { blogPosts } from "../data/products";
function BlogDetailPage() {
  const { slug } = useParams();
  const post = blogPosts.find((p) => p.slug === slug);
  const related = blogPosts.filter((p) => p.slug !== slug).slice(0, 3);
  if (!post) {
    return <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="font-bold text-gray-800 mb-4">Không tìm thấy bài viết</h2>
        <Link to="/blog" className="text-blue-700 hover:underline">← Quay lại góc sức khỏe</Link>
      </div>;
  }
  return <div className="max-w-7xl mx-auto px-4 py-5">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-5">
        <Link to="/" className="hover:text-blue-700">Trang chủ</Link>
        <ChevronRight size={14} />
        <Link to="/blog" className="hover:text-blue-700">Góc sức khỏe</Link>
        <ChevronRight size={14} />
        <span className="text-gray-800 line-clamp-1">{post.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {
    /* Article */
  }
        <article className="lg:col-span-2">
          <div className="bg-white rounded-2xl overflow-hidden">
            <img src={post.image} alt={post.title} className="w-full h-72 object-cover" />
            <div className="p-8">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ backgroundColor: "#e8efff", color: "#1250dc" }}>{post.category}</span>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock size={12} />
                  <span>{post.readTime} phút đọc</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(post.date).toLocaleDateString("vi-VN")}</span>
              </div>

              <h1 className="font-bold text-gray-900 mb-4" style={{ fontSize: "1.6rem", lineHeight: 1.35 }}>{post.title}</h1>

              <div className="flex items-center gap-3 mb-6 p-4 bg-gray-50 rounded-xl">
                <img src={post.authorAvatar} alt={post.author} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow" />
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{post.author}</div>
                  <div className="text-xs text-gray-500">Chuyên gia tư vấn sức khỏe</div>
                </div>
              </div>

              <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed">
                <p className="text-base mb-4">{post.excerpt}</p>
                <div className="whitespace-pre-line">{post.content}</div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 flex-wrap">
                  <Tag size={14} className="text-gray-400" />
                  {post.tags.map((tag) => <span key={tag} className="text-xs px-2.5 py-1 bg-gray-100 rounded-full text-gray-600 hover:bg-blue-100 hover:text-blue-700 cursor-pointer transition-colors">
                      #{tag}
                    </span>)}
                </div>
              </div>
            </div>
          </div>

          <Link to="/blog" className="inline-flex items-center gap-2 mt-5 text-sm font-medium hover:underline" style={{ color: "#1250dc" }}>
            <ArrowLeft size={16} /> Quay lại danh sách bài viết
          </Link>
        </article>

        {
    /* Sidebar */
  }
        <aside className="space-y-5">
          <div className="bg-white rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-4" style={{ fontSize: "0.95rem" }}>Bài viết liên quan</h3>
            <div className="space-y-4">
              {related.map((r) => <Link key={r.id} to={`/blog/${r.slug}`} className="group flex gap-3">
                  <img src={r.image} alt={r.title} className="w-20 h-16 object-cover rounded-xl shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-gray-500 mb-1">{r.category}</div>
                    <div className="text-sm font-medium text-gray-800 group-hover:text-blue-700 transition-colors line-clamp-2">{r.title}</div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                      <Clock size={10} />
                      <span>{r.readTime} phút</span>
                    </div>
                  </div>
                </Link>)}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5">
            <h3 className="font-semibold text-gray-800 mb-3" style={{ fontSize: "0.95rem" }}>Chủ đề phổ biến</h3>
            <div className="flex flex-wrap gap-2">
              {["vitamin", "omega-3", "mi\u1EC5n d\u1ECBch", "da \u0111\u1EB9p", "x\u01B0\u01A1ng kh\u1EDBp", "tim m\u1EA1ch", "dinh d\u01B0\u1EE1ng", "ng\u1EE7 ngon", "th\u1EC3 d\u1EE5c"].map((tag) => <Link key={tag} to={`/blog?q=${tag}`} className="text-xs px-2.5 py-1.5 bg-gray-100 rounded-full text-gray-600 hover:bg-blue-100 hover:text-blue-700 transition-colors">
                  #{tag}
                </Link>)}
            </div>
          </div>

          <div className="rounded-2xl p-5 text-white" style={{ backgroundColor: "#1250dc" }}>
            <h3 className="font-semibold mb-2" style={{ fontSize: "0.95rem" }}>Tư vấn sức khỏe miễn phí</h3>
            <p className="text-sm text-white/80 mb-4">Gặp dược sĩ chuyên nghiệp để được tư vấn trực tiếp về sức khỏe của bạn.</p>
            <a href="tel:18006928" className="block text-center bg-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors" style={{ color: "#1250dc" }}>
              Gọi 1800 6928 (Miễn phí)
            </a>
          </div>
        </aside>
      </div>
    </div>;
}
export {
  BlogDetailPage as default
};
