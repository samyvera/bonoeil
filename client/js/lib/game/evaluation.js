class Evaluation {
    constructor(parent, lilim) {
        this.lilim = lilim;

        this.bullets = [];
        this.bulletGenerator = [];
        var bulletData = [
            [1, 1, 0, 0],
            [-1, 1, 512, 0],
            [1, -1, 0, 512],
            [-1, -1, 512, 512]
        ];
        bulletData.forEach(bullet => {
            this.bulletGenerator.push({
                active: true,
                radius: 4,
                speed: {
                    x: 4,
                    y: 4
                },
                power: 1,
                dir: {
                    x: bullet[0],
                    y: bullet[1]
                },
                pos: {
                    x: bullet[2],
                    y: bullet[3]
                }
            });
        })

        this.frame = 0;
        this.fitess = 0;

        this.intersectionCircleCircle = (posA, r0, posB, r1) => {
            var dx = posB.x - posA.x;
            var dy = posB.y - posA.y;
            var d = Math.hypot(dx, dy);

            if (d > (r0 + r1)) return [];
            if (d < Math.abs(r0 - r1)) return [];

            var a = ((r0 * r0) - (r1 * r1) + (d * d)) / (2.0 * d);
            var x2 = posA.x + (dx * a / d);
            var y2 = posA.y + (dy * a / d);

            var h = Math.sqrt((r0 * r0) - (a * a));
            var rx = -dy * (h / d);
            var ry = dx * (h / d);

            return [{
                x: x2 + rx,
                y: y2 + ry
            }, {
                x: x2 - rx,
                y: y2 - ry
            }];
        }

        this.intersectionCircleLine = (pos, radius, p1, p2) => {
            var v1 = {
                x: p2.x - p1.x,
                y: p2.y - p1.y
            };
            var v2 = {
                x: p1.x - pos.x,
                y: p1.y - pos.y
            };

            var b = (v1.x * v2.x + v1.y * v2.y);
            b *= -2;
            var c = 2 * (v1.x * v1.x + v1.y * v1.y);
            var d = Math.sqrt(b * b - 2 * c * (v2.x * v2.x + v2.y * v2.y - radius * radius));

            var ret = [];
            if (!isNaN(d)) {
                var u1 = (b - d) / c;
                var u2 = (b + d) / c;

                if (u1 <= 1 && u1 >= 0) ret.push({
                    x: p1.x + v1.x * u1,
                    y: p1.y + v1.y * u1
                });
                if (u2 <= 1 && u2 >= 0) ret.push({
                    x: p1.x + v1.x * u2,
                    y: p1.y + v1.y * u2
                });
            }
            return ret;
        }

        this.updateLogic = () => {
            this.frame++;

            // Bullets
            this.lilim.bullets.forEach(bullet => {
                bullet.pos = {
                    x: bullet.pos.x + bullet.dir.x * bullet.speed.x,
                    y: bullet.pos.y + bullet.dir.y * bullet.speed.y
                }
            });
            if (this.frame % 16 === 0) {
                this.bulletGenerator.forEach(bulletData => this.bullets.push({
                    ...bulletData
                }));
            }
            this.bullets.forEach(bullet => {
                bullet.pos = {
                    x: bullet.pos.x + bullet.dir.x * bullet.speed.x,
                    y: bullet.pos.y + bullet.dir.y * bullet.speed.y
                }
            });

            this.bullets = this.bullets.filter(bullet => bullet.pos.x > 0 && bullet.pos.x < 512 && bullet.pos.y > 0 && bullet.pos.y < 512);

            // Lilim wings
            var wingSpeed = 360;
            var radOffSet = (this.frame * Math.PI * 2 / wingSpeed) % (Math.PI * 2);
            var radOffSet2 = (-this.frame * Math.PI * 2 / wingSpeed) % (Math.PI * 2);

            this.lilim.wings.forEach((wing, index) => {
                var length = wing.length;

                var rad = 2 * Math.PI * index / this.lilim.wings.length + radOffSet;
                var pos = {
                    x: Math.cos(rad) * this.lilim.radius,
                    y: Math.sin(rad) * this.lilim.radius
                }

                var rad2 = (2 * Math.PI * -index / this.lilim.wings.length + radOffSet2) + Math.PI / 2 * wing.angle / 360;
                wing.posA = {
                    x: this.lilim.pos.x + pos.x - Math.cos(rad2) * length,
                    y: this.lilim.pos.y + pos.y + Math.sin(rad2) * length
                }
                wing.posB = {
                    x: this.lilim.pos.x + pos.x + Math.cos(rad2) * length,
                    y: this.lilim.pos.y + pos.y - Math.sin(rad2) * length
                }

                if (wing.health > 0) {
                    this.bullets.forEach(bullet => {
                        if (this.intersectionCircleLine(bullet.pos, bullet.radius, wing.posA, wing.posB).length) {
                            wing.health = wing.health - bullet.power <= 0 ? 0 : wing.health - bullet.power;
                            bullet.active = false;
                        }
                    });
                }
            });

            if (this.lilim.health) {
                this.bullets.forEach(bullet => {
                    if (this.intersectionCircleCircle(bullet.pos, bullet.radius, this.lilim.pos, this.lilim.coreRadius).length) {
                        this.lilim.health = this.lilim.health - bullet.power <= 0 ? 0 : this.lilim.health - bullet.power;
                        bullet.active = false;
                    }
                });
            }

            // Lilim actions
            this.lilim.shoot(this.frame);
            this.bullets = this.bullets.filter(bullet => bullet.active);

            if (this.lilim.health) this.fitess++;
        }

        this.updateDisplay = () => {
            this.cx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            // Bullets
            this.cx.fillStyle = '#fff';
            this.lilim.bullets.forEach(bullet => {
                this.cx.beginPath();
                this.cx.arc(bullet.pos.x, bullet.pos.y, bullet.radius, 0, 2 * Math.PI);
                this.cx.fill();
            });
            this.bullets.forEach(bullet => {
                this.cx.beginPath();
                this.cx.arc(bullet.pos.x, bullet.pos.y, bullet.radius, 0, 2 * Math.PI);
                this.cx.fill();
            });

            // Lilim Core
            if (this.lilim.health) {
                this.cx.fillStyle = this.lilim.color;
                this.cx.beginPath();
                this.cx.arc(this.lilim.pos.x, this.lilim.pos.y, this.lilim.coreRadius, 0, 2 * Math.PI);
                this.cx.fill();

                this.cx.fillStyle = '#fff';
                this.cx.textAlign = 'center';
                this.cx.font = 20 + 'px roboto';
                this.cx.fillText(this.lilim.health, this.lilim.pos.x, this.lilim.pos.y + 7);
            }

            // Lilim wings
            this.cx.fillStyle = '#000';
            this.cx.lineWidth = 2;
            this.lilim.wings.forEach(wing => {
                if (wing.health > 0) {
                    this.cx.beginPath();
                    this.cx.moveTo(wing.posA.x, wing.posA.y);
                    this.cx.lineTo(wing.posB.x, wing.posB.y);
                    this.cx.stroke();
                }
            });
        }

        this.showResult = () => {
            this.cx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            this.cx.fillStyle = '#fff';
            this.cx.textAlign = 'center';
            this.cx.font = 72 + 'px roboto';
            this.cx.fillText(this.fitess, 256, 256);
        }

        this.canvas = document.createElement('canvas');
        this.canvas.width = 512;
        this.canvas.height = 512;
        this.cx = this.canvas.getContext('2d');
        this.cx.imageSmoothingEnabled = false;

        parent.appendChild(this.canvas);

        this.runEval = (app, src) => {
            var now = null;
            var then = Date.now();
            var interval = 1000 / 60;
            var delta = null;

            var frame = () => {
                now = Date.now();
                delta = now - then;

                if (delta > interval) {
                    this.updateLogic();
                    this.updateDisplay();

                    then = now - (delta % interval);
                }
                
                if (this.lilim.health) anim = requestAnimationFrame(frame);
                else {
                    this.showResult();
                    cancelAnimationFrame(anim);
                    Activity_Evaluate_Individual.step3(app, src, this.fitess);
                }
            }
            var anim = requestAnimationFrame(frame);
        }
    }
}