import { useState } from "react";
import { Link } from "react-router";
import { ShoppingCart, Heart, Star } from "lucide-react";
import { formatPrice } from "../data/products";
import { useCart } from "@/hooks/useCart.js";
function ProductCard({ product, showDiscount = true }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  // const isWishlisted = wishlist.includes(product.id);
  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product.medicineId, product.quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };
  // const handleWishlist = (e) => {
  //   e.preventDefault();
  //   toggleWishlist(product.id);
  // };
  return (
    <Link
      to={`/products/${product.id}`}
      className="group bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-blue-200 transition-all duration-200 flex flex-col"
    >
      <div className="relative overflow-hidden bg-gray-50">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* {showDiscount && product.discount && (
          <span
            className="absolute top-2 left-2 text-white text-xs font-semibold px-2 py-1 rounded-lg"
            style={{ backgroundColor: "#e53935" }}
          >
            -{product.discount}%
          </span>
        )}
        {product.isFlashSale && !product.discount && (
          <span
            className="absolute top-2 left-2 text-white text-xs font-semibold px-2 py-1 rounded-lg"
            style={{ backgroundColor: "#f05a22" }}
          >
            ⚡ Flash
          </span>
        )} */}
        {/* <button
          onClick={handleWishlist}
          className={`absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all ${isWishlisted ? "bg-red-50 text-red-500" : "bg-white text-gray-400 hover:text-red-400"}`}
        >
          <Heart size={16} fill={isWishlisted ? "currentColor" : "none"} />
        </button> */}
      </div>

      <div className="p-3 flex flex-col flex-1">
        {/* <div className="text-xs text-gray-400 mb-1">{product.brand}</div> */}
        <h3 className="text-sm text-gray-800 mb-2 line-clamp-2 flex-1 group-hover:text-blue-700 transition-colors">
          {product.name}
        </h3>
        <div className="text-xs text-gray-400 mb-2">{product.unit}</div>

        {/* <div className="flex items-center gap-1 mb-2">
          <Star size={12} fill="#fbbf24" className="text-yellow-400" />
          <span className="text-xs text-gray-600">{product.rating}</span>
          <span className="text-xs text-gray-400">
            ({product.reviewCount.toLocaleString()})
          </span>
          <span className="text-xs text-gray-400 ml-1">
            Đã bán{" "}
            {product.sold > 1e3
              ? `${(product.sold / 1e3).toFixed(1)}k`
              : product.sold}
          </span>
        </div> */}

        <div className="flex items-center justify-center gap-2 mb-3">
          <span
            className="font-semibold text-base"
            style={{ color: "#1250dc" }}
          >
            {formatPrice(product.price)}
          </span>
          {/* {product.originalPrice && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )} */}
        </div>

        <button
          onClick={handleAddToCart}
          className={`w-full py-2 rounded-lg text-sm font-medium transition-all ${added ? "bg-green-500 text-white" : "border text-blue-700 hover:text-white hover:bg-blue-700"}`}
          style={added ? {} : { borderColor: "#1250dc" }}
        >
          {added ? (
            "\u2713 \u0110\xE3 th\xEAm"
          ) : (
            <span className="flex items-center justify-center gap-1.5">
              <ShoppingCart size={14} />
              Chọn mua
            </span>
          )}
        </button>
      </div>
    </Link>
  );
}
export { ProductCard };
