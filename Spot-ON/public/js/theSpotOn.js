// GSAP - Connect the blocks with animated gradient lines
document.addEventListener("DOMContentLoaded", () => {
    const boxes = document.querySelectorAll(".box");

    // Create lines between each pair of boxes
    boxes.forEach((box, index) => {
      if (index < boxes.length - 1) {
        const nextBox = boxes[index + 1];
        const line = document.createElement("div");
        line.className = "line";
        document.querySelector(".presentationContainer").appendChild(line);

        // Position and animate the line
        const updateLine = () => {
          const boxRect = box.getBoundingClientRect();
          const nextRect = nextBox.getBoundingClientRect();
          const lineHeight = nextRect.top - boxRect.bottom;

          // Set line position and height
          gsap.set(line, {
            top: boxRect.bottom + window.scrollY + 10,
            left: boxRect.left + boxRect.width / 2 - 1.5,
            height: lineHeight - 20
          });
        };

        // Scroll-triggered animation
        ScrollTrigger.create({
          trigger: box,
          start: "top center",
          end: "bottom center",
          onUpdate: () => updateLine(),
          onEnter: () => {
            gsap.to(line, {
              background: "linear-gradient(135deg, #ff7e5f, #6a82fb, #fc5c7d)",
              duration: 1
            });
          }
        });

        window.addEventListener("resize", updateLine);
        updateLine();
      }
    });
  });