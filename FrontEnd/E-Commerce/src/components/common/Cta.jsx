
// ================================================================
// Cta.jsx — Convert từ bigspring Cta.js
// Thay next/image → <img>, next/link → Link
// ================================================================
import { Link } from "react-router-dom";

const Cta = ({ title, content, image, button }) => {
  return (
    <section className="section px-4">
      <div className="section container rounded-xl shadow">
        <div className="row mx-auto items-center justify-center">
          <div className="w-full px-4 md:w-5/12 lg:w-4/12">
            <img className="w-full" src={image} alt="call to action" />
          </div>
          <div className="mt-5 w-full px-4 text-center md:w-6/12 lg:w-5/12 md:mt-0 md:text-left">
            <h2>{title}</h2>
            <p className="mt-6">{content}</p>
            {button?.enable && (
              <Link className="btn btn-primary mt-4 inline-block" to={button.link}>
                {button.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Cta;
