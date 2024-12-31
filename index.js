const debutton = document.getElementById("debbuton");
const userCamera = document.getElementById("user_camera");

let canvaDisplayFreezed = false;

const video = document.querySelector("video");
const constraints = {
  audio: false,
  video: true,
};

const displayCanvas = document.createElement("canvas");
document.body.appendChild(displayCanvas);
displayCanvas.width = 300;
displayCanvas.height = 200;
const displayContext = displayCanvas.getContext("2d");

function renderImage(pixels, width, height) {
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i]; // Red
    const g = pixels[i + 1]; // Green
    const b = pixels[i + 2]; // Blue

    // Calculate grayscale value using the luminance formula
    const gray = 0.3 * r + 0.59 * g + 0.11 * b;

    // Set the red, green, and blue channels to the grayscale value
    pixels[i] = gray; // Red
    pixels[i + 1] = gray; // Green
    pixels[i + 2] = gray; // Blue
    // Alpha (pixels[i + 3]) remains unchanged

    // pixels[i] = r; // Red
    // pixels[i + 1] = g; // Green
    // pixels[i + 2] = b; // Blue
  }

  const newImageData = new ImageData(
    new Uint8ClampedArray(pixels),
    width,
    height
  );
  displayContext.putImageData(newImageData, 0, 0);
}

navigator.mediaDevices
  .getUserMedia(constraints)
  .then((stream) => {
    const videoTracks = stream.getVideoTracks();
    console.log("Got stream with constraints:", constraints);
    console.log(`Using video device: ${videoTracks[0].label}`);
    stream.onremovetrack = () => {
      console.log("Stream ended");
    };
    video.srcObject = stream;

    // Iniciar captura de frames assim que o vídeo começar a tocar
    video.onloadedmetadata = () => {
      video.play();
      captureFrames();
    };
  })
  .catch((error) => {
    if (error.name === "OverconstrainedError") {
      console.error(
        `The resolution ${constraints.video.width.exact}x${constraints.video.height.exact} px is not supported by your device.`
      );
    } else if (error.name === "NotAllowedError") {
      console.error(
        "You need to grant this page permission to access your camera and microphone."
      );
    } else {
      console.error(`getUserMedia error: ${error.name}`, error);
    }
  });

// Função para capturar frames
function captureFrames() {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  const processFrame = () => {
    // Configurar as dimensões do canvas para corresponder ao vídeo
    canvas.width = video.width;
    canvas.height = video.height;

    // Desenhar o frame atual no canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Aqui você pode pegar os dados do frame como uma imagem ou manipular os pixels
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data; // Matriz RGBA
    const frameData = canvas.toDataURL("image/png");
    console.log("Captured frame:", pixels);

    !canvaDisplayFreezed && renderImage(pixels, canvas.width, canvas.height);

    // Continuar capturando o próximo frame
    requestAnimationFrame(processFrame);
  };

  // Iniciar o loop de captura de frames
  processFrame();
}

debutton.addEventListener("click", async () => {
  canvaDisplayFreezed = !canvaDisplayFreezed;
  console.log("Debbuton clicked");
});

video.ontimeupdate = (e) => {
  console.log("Video progress", e.target);
};
