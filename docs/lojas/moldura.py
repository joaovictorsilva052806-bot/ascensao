from PIL import Image,ImageDraw,ImageFont,ImageFilter
CAP=[('1-hoje','Sua rotina vira um RPG','Quests, XP e nível de E a S'),('2-quests','Missões curtas, XP na hora','Toque em ▶ e o timer começa'),('3-foco','Foco de 25 minutos','Celular virado, XP entra sozinho'),('4-prog','Evolua o seu personagem','Avatar, atributos e baú'),('5-amigos','Derrotem o chefão juntos','Turma e liga só com apelido')]
F='/usr/share/fonts/opentype/inter/'
def comp(src,W,H,title,sub,out):
    bg=Image.new('RGB',(W,H),(7,12,23));d=ImageDraw.Draw(bg)
    # glow
    g=Image.new('RGB',(W,H),(0,0,0));gd=ImageDraw.Draw(g);gd.ellipse((-W*0.3,-H*0.25,W*1.3,H*0.45),fill=(20,60,120));g=g.filter(ImageFilter.GaussianBlur(W*0.12))
    bg=Image.blend(bg,g,0.55);d=ImageDraw.Draw(bg)
    for y in range(0,H,int(W*0.06)):d.line((0,y,W,y),fill=(14,26,46),width=1)
    ft=ImageFont.truetype(F+'Inter-Bold.otf',int(W*0.068));fs=ImageFont.truetype(F+'Inter-Regular.otf',int(W*0.036))
    fk=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf',int(W*0.026))
    y=int(H*0.05)
    k='[ ASCENSION ]';d.text(((W-d.textlength(k,font=fk))/2,y),k,font=fk,fill=(111,177,255));y+=int(W*0.06)
    d.text(((W-d.textlength(title,font=ft))/2,y),title,font=ft,fill=(255,255,255));y+=int(W*0.09)
    d.text(((W-d.textlength(sub,font=fs))/2,y),sub,font=fs,fill=(160,180,215))
    s=Image.open(src).convert('RGB');top=int(H*0.22);avail=H-top-int(H*0.03)
    sw=int(W*0.80);sh=int(s.height*sw/s.width)
    s=s.resize((sw,sh),Image.LANCZOS)
    if sh>avail:s=s.crop((0,0,sw,avail));sh=avail
    x=(W-sw)//2;r=int(W*0.05)
    m=Image.new('L',(sw,sh),0);ImageDraw.Draw(m).rounded_rectangle((0,0,sw-1,sh+r),r,fill=255)
    fr=ImageDraw.Draw(bg);pad=int(W*0.012);fr.rounded_rectangle((x-pad,top-pad,x+sw+pad,H+r),r+pad,fill=(18,30,52),outline=(61,139,255),width=max(2,W//360))
    bg.paste(s,(x,top),m);bg.save(out,optimize=True)
import sys,os
os.makedirs('docs/lojas/screenshots/iphone-65',exist_ok=True)
for k,t,sub in CAP:
    comp(f'/tmp/asc-shots/android-{k}.png',1080,1920,t,sub,f'docs/lojas/screenshots/android/{k}.png')
    comp(f'/tmp/asc-shots/iphone-{k}.png',1290,2796,t,sub,f'docs/lojas/screenshots/iphone/{k}.png')  # 6,9" (App Store aceita 1290x2796)
    comp(f'/tmp/asc-shots/iphone-{k}.png',1284,2778,t,sub,f'docs/lojas/screenshots/iphone-65/{k}.png')  # 6,5"
