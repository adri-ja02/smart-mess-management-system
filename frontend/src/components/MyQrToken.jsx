import { QRCodeSVG } from "qrcode.react";

// mealToken: the confirmed MealToken object (with tokenCode) from
// Maliha's getMyMealTokens(); mealMenu comes populated on it.
const MyQrToken = ({ mealToken }) => {
  if (!mealToken || mealToken.status !== "confirmed") {
    return null;
  }

  const menu =
    typeof mealToken.mealMenu === "object" ? mealToken.mealMenu : null;

  return (
    <div className="card shadow-sm text-center">
      <div className="card-body">
        {menu && (
          <>
            <h6 className="card-title text-capitalize mb-1">
              {menu.mealType}
            </h6>
            <p className="text-muted small mb-3">
              {new Date(menu.date).toLocaleDateString()}
            </p>
          </>
        )}

        <div className="d-flex justify-content-center mb-3">
          <QRCodeSVG value={mealToken.tokenCode} size={180} />
        </div>

        <p className="text-muted small mb-0">
          Show this at the counter to check in
        </p>
      </div>
    </div>
  );
};

export default MyQrToken;
