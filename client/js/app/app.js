class App {
    constructor() {

        // Socket

        this.socket = io();
        this.socket.on("connect_failed", () => this.socket.close());
        this.socket.on("disconnect", () => this.socket.close());
        this.socket.on("newMessage", message => this.updateChatBoard(message));

        // Local data

        this.activity = new Activity();

        this.individuals = [{
                genes: "28538d4e390e00200c82ff3f1a83090dba68a7528e4200920492e8c98d666f32c22d7a2644605792ec0cde0906dda3f7111c0d0b4cc9c486f3bbaf920b1d2d34fb", //
                fitness: 0,
                nickname: "Adam"
            },
            {
                genes: "285363fcffffff7f46464686ffffff3360a31919184072d825c1e20415106505031e409c15784d20e40600290b52f5",//
                fitness: 10,
                nickname: "Lilith"
            }
        ];

        // Document events

        document.ondragstart = event => {
            if (!event.target.id || !event.target.id.match(new RegExp('^img\\d{13}$'))) return false;
        }

        document.oncontextmenu = event => event.preventDefault();

        document.getElementById("chat-button").onclick = event => {
            let message = document.getElementById("chat-textarea").value.replace(/[<>{}[\]\\]/g, ' ').trim();
            if (message) {
                this.socket.emit("newMessage", message);
                document.getElementById("chat-textarea").value = '';
            }
        }

        document.getElementById("chat-textarea").onkeypress = event => {
            if (event.key === 'Enter') {
                event.preventDefault();
                document.getElementById("chat-button").click();
            }
        }

        document.getElementById("addIndividual-option").onclick = event => {
            event.preventDefault();
            Activity_Create_Individual.init(this);
        }

        document.getElementById("evaluate-button").onclick = event => {
            event.preventDefault();
            Activity_Evaluate_Individual.init(this);
        } 

        this.updateLocalIndividuals();
    }

    updateChatBoard = message => {
        var text = document.createElement("p");
        text.innerHTML = message.text;
        text.style.color = message.color;
        document.getElementById("chat-board").appendChild(text);
        document.getElementById("chat-board").scrollTo(0, document.getElementById("chat-board").scrollHeight);
    }

    updateLocalIndividuals = () => {
        document.getElementById("local-menu").innerHTML = "";

        this.individuals.sort((a, b) => {
            var nameA = a.fitness;
            var nameB = b.fitness;
            return (nameB < nameA || nameA === '???') ? -1 : (nameB > nameA || nameA !== '???') ? 1 : 0;
        });

        this.individuals.forEach(individual => {
            let menuOption = document.createElement("div");
            menuOption.className = "menu-option";
            menuOption.onclick = event => {
                event.preventDefault();
                Activity_Show_Individual.init(this, {
                    x: event.clientX,
                    y: event.clientY
                }, individual);
            }

            let circleImg = this.generateIndividualImg(individual);
            circleImg.className = "lilimImg";

            let nickname = document.createElement("p");
            nickname.innerHTML = individual.nickname + ' [' + individual.fitness + ']';

            menuOption.appendChild(circleImg);
            menuOption.appendChild(nickname);
            document.getElementById("local-menu").appendChild(menuOption);
        });
    }

    generateIndividualImg = (individual) => {
        const img = document.createElement("img");

        var src = "data:image/png;base64," +
            hexToBase64(
                "89504E470D0A1A0A" + // signature
                "0000000d" + "49484452" + "00000008000000080806000000" + "C40FBE8B" + // IHDR
                "000000" + ((individual.genes.length - 8) / 2).toString(16) + "49444154" + individual.genes + getCRC("49444154" + individual.genes) + // IDAT
                "00000000" + "49454E44" + "AE426082" // IEND
            );

        img.src = src;
        img.style.imageRendering = 'pixelated';
        img.draggable = false;
        return img;
    }
}