// ================================================================
// HomePage.jsx — Convert từ bigspring app/page.js
// Thay đổi:
//   Data tĩnh từ .md file → hardcode trực tiếp (hoặc config)
//   next/image → <img>
//   next/link  → Link từ react-router-dom
//   Swiper giữ nguyên (cùng package)
//   Thêm section sản phẩm nổi bật kết nối API thật
// ================================================================
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ChevronRight } from "lucide-react";
import { useMedicines, useCategories } from "@/hooks/useMedicines.js";
import MedicineCard from "@/components/medicine/MedicineCard.jsx";

// ── Data tĩnh từ _index.md ────────────────────────────────────────
const banner = {
  title: "Nhà thuốc online uy tín — Chăm sóc sức khoẻ của bạn",
  content:
    "Hơn 10,000 sản phẩm thuốc và thực phẩm chức năng chính hãng. Giao hàng nhanh, giá tốt, đảm bảo chất lượng.",
  image: "/images/banner-art.svg",
  button: { label: "Mua ngay", link: "/medicines" },
};

const features = [
  {
    name: "Hàng chính hãng",
    icon: "/images/checkmark-circle.svg",
    content: "100% sản phẩm có nguồn gốc rõ ràng, đảm bảo chất lượng",
  },
  {
    name: "Giao hàng nhanh",
    icon: "/images/speedometer.svg",
    content: "Giao hàng trong ngày tại nội thành, toàn quốc 2-3 ngày",
  },
  {
    name: "Tư vấn 24/7",
    icon: "/images/user-clock.svg",
    content: "Đội ngũ dược sĩ tư vấn miễn phí mọi lúc mọi nơi",
  },
  {
    name: "Giá tốt nhất",
    icon: "/images/love.svg",
    content: "Cam kết giá tốt nhất, hoàn tiền nếu tìm được rẻ hơn",
  },
  {
    name: "Đặt hàng dễ dàng",
    icon: "/images/code.svg",
    content: "Giao diện đơn giản, đặt hàng chỉ trong vài bước",
  },
  {
    name: "Lưu trữ đám mây",
    icon: "/images/cloud.svg",
    content: "Lịch sử đơn hàng và đơn thuốc được lưu trữ an toàn",
  },
];

const services = [
  {
    title: "Thuốc kê đơn & không kê đơn đầy đủ",
    content:
      "Chúng tôi cung cấp đầy đủ các loại thuốc từ thuốc thông thường đến thuốc đặc trị, đảm bảo đúng nguồn gốc và hạn sử dụng.",
    images: ["/images/service-slide-1.png", "/images/service-slide-2.png"],
    button: { enable: true, label: "Xem sản phẩm", link: "/medicines" },
  },
  {
    title: "Thực phẩm chức năng & Vitamin",
    content:
      "Bổ sung dinh dưỡng cho cả gia đình với hàng nghìn sản phẩm vitamin, khoáng chất từ các thương hiệu uy tín trong và ngoài nước.",
    images: ["/images/service-slide-3.png"],
    button: {
      enable: true,
      label: "Khám phá ngay",
      link: "/medicines?categoryId=2",
    },
  },
];

const workflow = {
  title: "Đặt hàng dễ dàng chỉ trong 3 bước",
  image: "/images/banner.svg",
  description: "Chọn sản phẩm → Thanh toán → Nhận hàng tại nhà",
};

const callToAction = {
  title: "Sẵn sàng chăm sóc sức khoẻ?",
  content:
    "Đăng ký ngay để nhận ưu đãi 10% cho đơn hàng đầu tiên và tích điểm thưởng mỗi lần mua.",
  image: "/images/cta.svg",
  button: { enable: true, label: "Đăng ký ngay", link: "/register" },
};

// ── Component ─────────────────────────────────────────────────────
export default function HomePage() {
  const { data: medicinesData, isLoading } = useMedicines({
    limit: 8,
    page: 1,
  });
  const { data: categoriesData } = useCategories();

  return (
    <>
      {/* ── Banner ────────────────────────────────────────────── */}
      <section className="section pb-[50px]">
        <div className="container">
          <div className="row text-center">
            <div className="mx-auto w-full px-4 lg:w-10/12">
              <h1 className="font-primary font-bold">{banner.title}</h1>
              <p className="mt-4 text-lg">{banner.content}</p>
              <Link
                className="btn btn-primary mt-6 inline-block"
                to={banner.button.link}
              >
                {banner.button.label}
              </Link>
              <img
                className="mx-auto mt-12 w-full max-w-[750px]"
                src={banner.image}
                alt="banner"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="section bg-theme-light">
        <div className="container">
          <div className="text-center">
            <h2>Tại sao chọn Nhà Thuốc Online?</h2>
          </div>
          <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item, i) => (
              <div
                className="feature-card rounded-xl bg-white p-5 pb-8 text-center"
                key={i}
              >
                <img className="mx-auto w-[30px]" src={item.icon} alt="" />
                <div className="mt-4">
                  <h3 className="h5">{item.name}</h3>
                  <p className="mt-3 text-sm">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ──────────────────────────────────────────── */}
      {services.map((service, index) => {
        const isOdd = index % 2 > 0;
        return (
          <section
            key={index}
            className={`section ${isOdd ? "bg-theme-light" : ""}`}
          >
            <div className="container">
              <div className="items-center gap-8 md:grid md:grid-cols-2">
                {/* Swiper carousel */}
                <div
                  className={`service-carousel ${!isOdd ? "md:order-2" : ""}`}
                >
                  <Swiper
                    modules={[Autoplay, Pagination]}
                    pagination={
                      service.images.length > 1 ? { clickable: true } : false
                    }
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                  >
                    {service.images.map((slide, i) => (
                      <SwiperSlide key={i}>
                        <img src={slide} alt="" className="w-full rounded-xl" />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>

                {/* Content */}
                <div
                  className={`service-content mt-5 md:mt-0 ${!isOdd ? "md:order-1" : ""}`}
                >
                  <h2 className="font-bold leading-[40px]">{service.title}</h2>
                  <p className="mb-2 mt-4">{service.content}</p>
                  {service.button.enable && (
                    <Link to={service.button.link} className="cta-link mt-4">
                      {service.button.label}
                      <img
                        className="ml-1"
                        src="/images/arrow-right.svg"
                        width={18}
                        alt=""
                      />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── Sản phẩm nổi bật — kết nối API thật ─────────────── */}
      <section className="section bg-theme-light">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2>Sản phẩm nổi bật</h2>
            <Link to="/medicines" className="cta-link text-sm">
              Xem tất cả <ChevronRight size={16} />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {Array(8)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl h-64 animate-pulse"
                  />
                ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {medicinesData?.items?.map((medicine) => (
                <MedicineCard key={medicine.medicineId} medicine={medicine} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Workflow ──────────────────────────────────────────── */}
      <section className="section pb-0">
        <div className="mb-8 text-center">
          <h2 className="mx-auto max-w-[400px] font-bold leading-[44px]">
            {workflow.title}
          </h2>
          <p className="mt-3">{workflow.description}</p>
        </div>
        <img src={workflow.image} alt="workflow" className="w-full" />
      </section>

      {/* ── Call to Action ────────────────────────────────────── */}
      <section className="section px-4">
        <div className="section container rounded-xl shadow">
          <div className="row mx-auto items-center justify-center">
            <div className="w-full px-4 md:w-5/12 lg:w-4/12">
              <img className="w-full" src={callToAction.image} alt="cta" />
            </div>
            <div className="mt-5 w-full px-4 text-center md:w-6/12 lg:w-5/12 md:mt-0 md:text-left">
              <h2>{callToAction.title}</h2>
              <p className="mt-6">{callToAction.content}</p>
              {callToAction.button.enable && (
                <Link
                  className="btn btn-primary mt-4 inline-block"
                  to={callToAction.button.link}
                >
                  {callToAction.button.label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
