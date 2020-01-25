class Activity {}

class Activity_Show_Individual {}
Activity_Show_Individual.init = (app, pos, indivdual) => {
    var id = Date.now();
    var indivdualElem = document.createElement("div");
    indivdualElem.className = "individual-elem";
    indivdualElem.id = "individual-elem" + id;
    indivdualElem.style.left = pos.x + "px";
    indivdualElem.style.top = pos.y + "px";
    indivdualElem.onclick = event => {
        var zIndex = document.getElementById(indivdualElem.id) ? parseInt(document.getElementById(indivdualElem.id).style.zIndex) || 0 : 0;
        Array.from(document.getElementsByClassName("individual-elem")).forEach(elem => {
            if (elem.style.zIndex && elem.id !== indivdualElem.id && parseInt(elem.style.zIndex) >= zIndex) {
                zIndex = parseInt(elem.style.zIndex) + 1;
            }
        });
        if (document.getElementById(indivdualElem.id)) document.getElementById(indivdualElem.id).style.zIndex = zIndex;
    }

    var option = document.createElement("div");
    option.className = "individual-options";

    var indivdualElemDrag = document.createElement("div");
    indivdualElemDrag.className = "individual-elemheader";
    indivdualElemDrag.id = "individual-elem" + id + "header";

    var indivdualElemNickname = document.createElement("p");
    indivdualElemNickname.innerHTML = indivdual.nickname;
    indivdualElemNickname.className = "individual-elem-nickname";

    var drag = event => event.dataTransfer.setData("text", event.target.id);

    var img = app.generateIndividualImg(indivdual);
    img.id = "img" + id;
    img.draggable = true;
    img.ondragstart = drag;

    var indivdualElemGenes = document.createElement("code");
    indivdualElemGenes.innerHTML = indivdual.genes;
    indivdualElemGenes.className = "individual-elem-genes";

    var indivdualElemFitness = document.createElement("p");
    indivdualElemFitness.innerHTML = 'Fitness: ' + indivdual.fitness;
    indivdualElemFitness.className = "individual-elem-fitness";

    var indivdualElemButton = document.createElement("button");
    indivdualElemButton.onclick = () => {
        document.body.removeChild(indivdualElem);
    }

    option.appendChild(indivdualElemDrag);
    option.appendChild(indivdualElemButton);
    indivdualElem.appendChild(option);
    indivdualElem.appendChild(indivdualElemNickname);
    indivdualElem.appendChild(img);
    indivdualElem.appendChild(indivdualElemGenes);
    indivdualElem.appendChild(indivdualElemFitness);
    document.body.appendChild(indivdualElem);

    dragElement(indivdualElem);
}

class Activity_Create_Individual {}
Activity_Create_Individual.init = app => {
    if (document.getElementById("create-individual-elem")) {
        document.getElementById("create-individual-elem").remove();
    }
    if (document.getElementById("evaluate-individual-elem")) {
        document.getElementById("evaluate-individual-elem").remove();
    }

    var createIndivdualElem = document.createElement("div");
    createIndivdualElem.id = "create-individual-elem";

    var createIndivdualElemElemButton = document.createElement("button");
    createIndivdualElemElemButton.onclick = () => {
        document.getElementById("create-individual-elem").remove();
    }

    var title = document.createElement("p");
    title.innerHTML = "Create a new lilim";
    title.id = "create-individual-elem-title";

    var parentContainer = document.createElement("div");
    parentContainer.className = "parentContainer";

    var checkStep2 = () => {
        if (document.getElementById("parent1").innerHTML !== '' &&
            document.getElementById("parent2").innerHTML !== '') {
            Activity_Create_Individual.step2(app);
        }
    }

    var allowDrop = event => event.preventDefault();

    var drop = event => {
        event.preventDefault();
        var data = event.dataTransfer.getData("text");
        var nodeCopy = document.getElementById(data).cloneNode(true);
        nodeCopy.id = "img" + Date.now();
        nodeCopy.draggable = false;
        event.target.innerHTML = '';
        event.target.appendChild(nodeCopy);
        event.target.ondragover = false;
        checkStep2();
    }

    var parent1 = document.createElement("div");
    parent1.id = "parent1";
    parent1.ondrop = drop;
    parent1.ondragover = allowDrop;

    var parent2 = document.createElement("div");
    parent2.id = "parent2";
    parent2.ondrop = drop;
    parent2.ondragover = allowDrop;

    createIndivdualElem.appendChild(createIndivdualElemElemButton);
    createIndivdualElem.appendChild(title);
    parentContainer.appendChild(parent1);
    parentContainer.appendChild(parent2);
    createIndivdualElem.appendChild(parentContainer);
    document.getElementById("activity-container").appendChild(createIndivdualElem);
}

var imgToArray = img => {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 8;
    canvas.height = 8;
    ctx.drawImage(img, 0, 0);
    return new Uint8Array(ctx.getImageData(0, 0, 8, 8).data.buffer);
}

var test2 = img => {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 8;
    canvas.height = 8;
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL();
}

var fuseImg = (img, src1, src2) => {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = 8;
    canvas.height = 8;
    ctx.clearRect(0, 0, 8, 8);
    new Promise(resolve => {
        var img1 = document.createElement("img");
        img1.onload = () => resolve(img1);
        img1.src = src1;
    }).then(res => {
        new Promise(resolve => {
            var img2 = document.createElement("img");
            img2.onload = () => {
                ctx.drawImage(res, 0, 0);
                ctx.globalAlpha = 0.5;
                ctx.drawImage(img2, 0, 0);
                resolve(canvas.toDataURL());
            };
            img2.src = src2;
        }).then(res => img.src = res);
    });
}

var confirmNewIndividual = (app, name, genes) => {
    if (name) {
        app.individuals.push({
            genes: base64ToHex(genes.replace("data:image/png;base64,", "")).slice(82, -32),
            fitness: 'Unknown',
            nickname: name
        });
        document.getElementById("activity-container").innerHTML = "";
        app.updateLocalIndividuals();
    }
}

Activity_Create_Individual.step2 = app => {
    var container = document.getElementById("create-individual-elem");

    var childContainer = document.createElement("div");
    childContainer.className = "childContainer";

    var child = document.createElement("img");
    child.style.imageRendering = 'pixelated';
    fuseImg(child,
        test2(document.getElementById("parent1").firstChild),
        test2(document.getElementById("parent2").firstChild)
    );

    var childName = document.createElement("textarea");
    childName.className = "childName";
    childName.placeholder = "Child name";
    childName.value = "Lilim";

    var confirm = document.createElement("button");
    confirm.className = "confirm-button";
    confirm.innerHTML = "Confirm";
    confirm.onclick = () => confirmNewIndividual(app, childName.value.replace(/[<>{}[\]\\]/g, ' ').trim(), child.src);

    childContainer.appendChild(child);
    childContainer.appendChild(childName);
    childContainer.appendChild(confirm);
    container.appendChild(childContainer);
}

var hexToBase64 = str => btoa(String.fromCharCode.apply(null, str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" ")));

var base64ToHex = str => {
    for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
        var tmp = bin.charCodeAt(i).toString(16);
        if (tmp.length === 1) tmp = "0" + tmp;
        hex[hex.length] = tmp;
    }
    return hex.join("");
}

// CRC32

var signed_crc_table = () => {
	var c = 0, table = new Array(256);
	for(var n =0; n != 256; ++n){
		c = n;
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		c = ((c&1) ? (-306674912 ^ (c >>> 1)) : (c >>> 1));
		table[n] = c;
	}
	return typeof Int32Array !== 'undefined' ? new Int32Array(table) : table;
}

var T = signed_crc_table();
var crc32_buf = (buf, seed) => {
	var C = seed ^ -1, L = buf.length - 3;
	for(var i = 0; i < L;) {
		C = (C>>>8) ^ T[(C^buf[i++])&0xFF];
		C = (C>>>8) ^ T[(C^buf[i++])&0xFF];
		C = (C>>>8) ^ T[(C^buf[i++])&0xFF];
		C = (C>>>8) ^ T[(C^buf[i++])&0xFF];
	}
	while(i < L+3) C = (C>>>8) ^ T[(C^buf[i++])&0xFF];
	return C ^ -1;
}

var decimalToHexString = number => {
    if (number < 0) number = 0xFFFFFFFF + number + 1;
    return number.toString(16).toUpperCase();
}

var toCharData = str => {
    var res = [];
    for (let i = 0; i < str.length; i+=2) res.push(0 + 'x' + str[i] + str[i+1]);
    return res;
}

var getCRC = str => decimalToHexString(crc32_buf(toCharData(str)));

class Activity_Evaluate_Individual {}
Activity_Evaluate_Individual.init = app => {
    if (document.getElementById("evaluate-individual-elem")) {
        document.getElementById("evaluate-individual-elem").remove();
    }
    if (document.getElementById("create-individual-elem")) {
        document.getElementById("create-individual-elem").remove();
    }

    var evaluateIndivdualElem = document.createElement("div");
    evaluateIndivdualElem.id = "evaluate-individual-elem";

    var evaluateIndivdualElemElemButton = document.createElement("button");
    evaluateIndivdualElemElemButton.onclick = () => {
        document.getElementById("evaluate-individual-elem").remove();
    }

    var title = document.createElement("p");
    title.innerHTML = "Evaluate a lilim";
    title.id = "evaluate-individual-elem-title";

    var parentContainer = document.createElement("div");
    parentContainer.className = "parentContainer";

    var checkStep2 = () => {
        if (document.getElementById("lilim").innerHTML !== '') Activity_Evaluate_Individual.step2(app);
    }

    var allowDrop = event => event.preventDefault();

    var drop = event => {
        event.preventDefault();
        var data = event.dataTransfer.getData("text");
        var nodeCopy = document.getElementById(data).cloneNode(true);
        nodeCopy.id = "img" + Date.now();
        nodeCopy.draggable = false;
        event.target.innerHTML = '';
        event.target.appendChild(nodeCopy);
        event.target.ondragover = false;
        checkStep2();
    }

    var lilim = document.createElement("div");
    lilim.id = "lilim";
    lilim.ondrop = drop;
    lilim.ondragover = allowDrop;

    evaluateIndivdualElem.appendChild(evaluateIndivdualElemElemButton);
    evaluateIndivdualElem.appendChild(title);
    parentContainer.appendChild(lilim);
    evaluateIndivdualElem.appendChild(parentContainer);
    document.getElementById("activity-container").appendChild(evaluateIndivdualElem);
}

Activity_Evaluate_Individual.step2 = app => {
    var container = document.getElementById("evaluate-individual-elem");

    var childContainer = document.createElement("div");
    childContainer.className = "childContainer";

    container.appendChild(childContainer);

    var lilimImg = document.getElementById("lilim").firstElementChild;
    var array = [];
    var pngArr = imgToArray(lilimImg);
    for (let i = 0; i < pngArr.length; i++) {
        if ((i % 4) !== 3) array.push(pngArr[i]);
    }
    var lilim = new Lilim(array);
    var evaluation = new Evaluation(childContainer, lilim);
    evaluation.runEval(app, lilimImg.src);
}

Activity_Evaluate_Individual.step3 = (app, genes, fitness) => {
    var originalGenes = base64ToHex(genes.replace("data:image/png;base64,", "")).slice(82, -32);
    app.individuals.map(lilim =>  {
        if (lilim.genes === originalGenes) lilim.fitness = fitness;
    });
    app.updateLocalIndividuals();
}