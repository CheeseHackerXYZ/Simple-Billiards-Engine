# Simple-billiards-engine

A lightweight, high-performance billiards physics engine built with **pure Vanilla JavaScript**. 
This project is designed as a minimal template for developers to understand physics collisions or to build their own web-based pool games.

## 🚀 Key Features

- **No Libraries Required**: Built entirely with standard Web APIs. No Matter.js, No P5.js, No external dependencies.
- **Pure Physics**: Features realistic ball-to-ball and ball-to-wall collision logic using vector math.
- **Minimalistic Design**: Clean UI/UX focused on the core game mechanics.
- **Mobile Friendly**: Supports both Mouse and Touch events.

## 🛠 Customization Guide

This engine is built to be easily modified. Here are some quick ways to customize the behavior:

### 1. Physics & Constants (「script.js」)
You can adjust the "feel" of the game by changing these constants at the top of the script:
- 「FRICTION」: Change the table friction (e.g., 「0.99」 for a faster table, 「0.95」 for a heavy one).
- 「ball_r」: Modify the radius of the balls.
- 「MAX_PULL」: Adjust the maximum shooting power.

### 2. Colors & Themes (「style.css」)
We use CSS Variables for easy skinning:
- 「--bg-color」: Background of the page.
- 「--table-color」: The color of the pool table.
- 「--border-color」: The table frame color.

*Note: Individual ball colors (including the Cue Ball) are managed within the 「draw()」 method in 「script.js」 for more granular control.*

## 📂 File Structure

```text
simple-billiards-engine/
├── index.html   # Main structure
├── style.css # Design & Themes
├── script.js # Core Physics Engine
├── LICENSE      # MIT License
└── README.md    # Documentation
```
## 📝 How to Use

1. Fork or Import this repository.
2. Open 「index.html」 in any modern web browser.
3. Drag the **Blue Ball (Cue Ball)** to aim, and release to shoot.
4. Press the **RESET BALLS** button to restart the layout.

## 📜 License

This project is licensed under the **MIT License**. You are free to use, modify, and distribute this code for personal or commercial projects.

---

Star this repo if you find it useful.
