var seconds = 0;

var bitcoint = 0;

// window.setInterval(
// function () {
//     if (bitcoint == 0){
//         bitcoint = 0.00000001
//     }else{
//         bitcoint = bitcoint + (2 * bitcoint);
//     }
//     document.getElementById("bitcoints").innerHTML = "You have " + bitcoint + " bitcoints!";
// }, 3600000);

function getAmount() {
    return bitcoint;
}

this.start = function() {
    interval = setInterval(function () {
        if (bitcoint == 0){
            bitcoint = 0.00000001
        }else{
            bitcoint = bitcoint + (2 * bitcoint);
        }
        console.log(bitcoint)
    }, 3600000);
}

this.stop = function(){
    console.log("you have earnd: " + bitcoint + "bitcoins")
    clearInterval(interval);
    interval = null;
}