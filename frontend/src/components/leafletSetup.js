import L from "leaflet";

export const createClusterCustomIcon = (pickupIcon) => (cluster) => {
  const count = cluster.getChildCount();
  const pinUrl = pickupIcon.options.iconUrl;

  const size = 50;
  const badgeSize = 22;

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = pinUrl;

  return new Promise((resolve) => {
    img.onload = () => {
      const pinW = 36;
      const pinH = 36;

      ctx.drawImage(img, (size - pinW) / 2, (size - pinH) / 2, pinW, pinH);

      ctx.fillStyle = "#1E40AF"; // UCLA navy
      ctx.beginPath();
      ctx.arc(size - badgeSize / 2, size - badgeSize / 2, badgeSize / 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "white";
      ctx.font = "bold 12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(count, size - badgeSize / 2, size - badgeSize / 2);

      resolve(
        L.icon({
          iconUrl: canvas.toDataURL(),
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
          className: "custom-cluster-icon",
        })
      );
    };
  });
};
