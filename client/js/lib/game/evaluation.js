class Evaluation {
    constructor(parent, lilim) {
        this.lilim = lilim;

        this.frame = 0;

        this.update = () => {
            this.frame++;
            
            this.cx.fillStyle = this.lilim.color;
            this.cx.beginPath();
            this.cx.arc(256, 256, 32, 0, 2 * Math.PI);
            this.cx.fill();

            this.cx.fillStyle = '#fff';
            this.cx.textAlign = 'center';
            this.cx.font = 20 + 'px serif';
            this.cx.fillText(this.lilim.health, 256, 256 + 5);
        };

        this.canvas = document.createElement('canvas');
        this.canvas.width = 512;
        this.canvas.height = 512;
        this.cx = this.canvas.getContext('2d');
        this.cx.imageSmoothingEnabled = false;

        parent.appendChild(this.canvas);
        
        this.runEval = () => {
            var now = null;
            var then = Date.now();
            var interval = 1000/60;
            var delta = null;
    
            var frame = () => {
                now = Date.now();
                delta = now - then;
    
                if (delta > interval) {
                    this.update();
                    then = now - (delta % interval);
                }
    
                requestAnimationFrame(frame);
            }
            requestAnimationFrame(frame);
        }
        this.runEval();
    }
}