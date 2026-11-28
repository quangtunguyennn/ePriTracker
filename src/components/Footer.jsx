import { faFacebook } from "@fortawesome/free-brands-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faLinkedin } from "@fortawesome/free-brands-svg-icons";

import { faEnvelope } from "@fortawesome/free-solid-svg-icons";

import { faStrava } from "@fortawesome/free-brands-svg-icons";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <>
      <div className="bg-black flex gap-20 pl-40 pr-40 pt-20 text-white">
        <div className="w-3/4">
          <div className="text-white pb-2">
            <div className="flex gap-8 ">
              <p className="font-syne text-5xl font-black pb-4 italic">
                ePriTracker
              </p>

              {/* <div className="bg-mist-50 rounded-full flex items-center justify-center p-4">

                <img className="w-8 h-8 object-contain" src="/paypal.png" />

              </div> */}
            </div>

            <p className=" -mt-12 pl-14 font-syne text-7xl text-yellow-700 font-semibold italic">
              {t("Track Smarter")}
            </p>
          </div>

          <div>
            <div className="flex justify-between pt-4 font-urbanist font-semibold text-xl text-gray-300 pb-12 border-b border-gray-600 flex pl-20 pr-20">
              <div>
                <p className="block bg-orange-500 hover:bg-orange-600 text-white font-semibold py-1 px-24 rounded-br-3xl rounded-tr-sm rounded-bl-lg transition duration-300 shadow-md">
                  <FontAwesomeIcon
                    icon={faStrava}
                    className="mr-4"
                  ></FontAwesomeIcon>

                  <a href="/products" className="no-underline text-white">
                    {t("Start Tracking Now!")}
                  </a>
                </p>
              </div>

              <div className="flex gap-12">
                <a href="/" className="hover:underline">
                  {t("Home")}
                </a>

                <a href="/events" className="hover:underline">
                  {t("Events")}
                </a>
              </div>
            </div>

            <div className="flex justify-between cursor-pointer font-questrial text-[14px] p-4 border-b border-gray-600 text-gray-500">
              <div>
                <p className="hover:underline-offset-4 hover:underline">
                  {t("Terms of Use")}
                </p>

                <p className="hover:underline-offset-4 hover:underline">
                  {t("Data Protection Policy")}
                </p>

                <p className="hover:underline-offset-4 hover:underline">
                  {t("Customize Cookies")}
                </p>
              </div>

              <div>
                <p className="hover:underline-offset-4 hover:underline">
                  {t("Cookie Statement")}
                </p>

                <p className="hover:underline-offset-4 hover:underline">
                  {t("Risk Violation Reporting")}
                </p>
              </div>

              <div>
                <p className="hover:underline-offset-4 hover:underline">
                  {t("Vulnerability Disclosure")}
                </p>

                <p className="hover:underline-offset-4 hover:underline">
                  Procurement @ ePriTracker
                </p>
              </div>
            </div>

            <div className="flex justify-between text-white font-syne p-4">
              <div>
                <p className="text-gray-400 font-medium font-lexend">
                  {t("Copyright © 2026 TK team.")}
                </p>
              </div>

              <div className="flex gap-2">
                <FontAwesomeIcon
                  icon={faFacebook}
                  className="text-2xl"
                ></FontAwesomeIcon>

                <FontAwesomeIcon
                  icon={faLinkedin}
                  className="text-2xl"
                ></FontAwesomeIcon>

                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="text-2xl"
                ></FontAwesomeIcon>
              </div>
            </div>
          </div>
        </div>

        <div className="text-white w-1/4">
          <img src="/f-2.png" alt="" />
        </div>
      </div>
    </>
  );
}
