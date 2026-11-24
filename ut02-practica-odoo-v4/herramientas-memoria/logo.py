# Logo de la Cervecería artesana Springfield (512x512, PIL)
from PIL import Image, ImageDraw, ImageFont
W = 512; im = Image.new("RGBA", (W, W), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
AMBAR, MARRON, CREMA, VERDE = (214, 140, 30), (70, 40, 20), (250, 240, 215), (90, 140, 50)
d.ellipse((6, 6, W - 6, W - 6), fill=MARRON); d.ellipse((22, 22, W - 22, W - 22), fill=CREMA)
# barril
d.rounded_rectangle((176, 120, 336, 300), 40, fill=AMBAR, outline=MARRON, width=6)
for y in (160, 260): d.line((182, y, 330, y), fill=MARRON, width=8)
# hoja de lúpulo encima
for dx, dy in ((0, 0), (-22, 18), (22, 18), (0, 34)):
    d.ellipse((240 + dx, 70 + dy, 272 + dx, 104 + dy), fill=VERDE, outline=(50, 90, 30), width=3)
f1 = ImageFont.truetype("arialbd.ttf", 44); f2 = ImageFont.truetype("arial.ttf", 30)
def centro(t, y, f, c):
    w = d.textlength(t, font=f); d.text(((W - w) / 2, y), t, font=f, fill=c)
centro("SPRINGFIELD", 318, f1, MARRON); centro("cervecería artesana", 372, f2, MARRON); centro("· desde 2026 ·", 412, f2, AMBAR)
im.save("logo-cerveceria-springfield.png"); print("ok")
