
var listaAmigos = new Map();
var log = { titulo: "Resultado do Sorteio" };

function adicionar() {

    var nomeAmigo = document.getElementById('nome-amigo'); 
    var emailAmigo = document.getElementById('email-amigo'); 

    if (!validarCampos(nomeAmigo, emailAmigo)) return;

    listaAmigos.set(nomeAmigo.value, emailAmigo.value);

    limparCampos(...[nomeAmigo, emailAmigo]);    

    atualizarLista();
        
}

function sortear() {
    
    var amigosSorteados = Array.from(listaAmigos.keys());
    var listaSorteio = [];    
    log.qtdParticipantes = listaAmigos.size;
    log.resultado = '';    

    if (listaAmigos.size < 4) {
        alert('O sorteio deve conter, no mínimo, 4 amigos');
        return;
    }

    for (var [amigo, email] of listaAmigos) {

        var numAle = Math.floor(Math.random() * amigosSorteados.length);
        var pessoaSorteada = amigo != amigosSorteados[numAle] ? amigosSorteados.splice(numAle, 1) : amigosSorteados.splice(numAle - 1, 1);      

        if (amigo == pessoaSorteada) sortear();

        listaSorteio.push([amigo, email, pessoaSorteada[0]]); 
 
        log.resultado += `Sorteio ${listaSorteio.length}: ${amigo} (${email}) --> ${pessoaSorteada}; `;       

    };  

    limparCampos(document.getElementById('lista-amigos'));

    alert("Sorteio realizado com sucesso");

    downloadResultado();
    
    //enviarEmail(listaSorteio); 

}

function reiniciar() {

    var campoAmigos = document.getElementById('lista-amigos');
    var nomeAmigo = document.getElementById('nome-amigo');
    var emailAmigo = document.getElementById('email-amigo');
    var downloadResultado = document.getElementById('download-resultados');

    listaAmigos.clear();
    limparCampos(...[campoAmigos, nomeAmigo, emailAmigo, downloadResultado]);

}

function atualizarLista() {

    var lista = document.getElementById('lista-amigos');
    lista.textContent = '';

    for (var [amigo, email] of listaAmigos) {

        var paragrafo = document.createElement('p');
        paragrafo.textContent = amigo + ' - ' + email;
        setarAtributos(paragrafo, {'style': 'cursor: pointer', 
                                    'onMouseOver': "this.style.color='#00f4bf'", 
                                    'onMouseOut': "this.style.color='#fff'",
                                    'onclick': `excluirAmigo('${amigo}')`});
        
        lista.appendChild(paragrafo);        

    }

    mostrarToolTip();

}

function excluirAmigo(amigo) {

    listaAmigos.delete(amigo);
    atualizarLista();

}

function setarAtributos(elemento, valores) {

    for (chave in valores) {
        elemento.setAttribute(chave, valores[chave]);
    }
}

function limparCampos() {

    [...arguments].forEach(campo => {
        if (campo.nodeName == 'INPUT') campo.value = '';
        else campo.textContent = '';
    });

}

function validarCampos(nomeAmigo, emailAmigo) {

    if (nomeAmigo.value == '' || listaAmigos.has(nomeAmigo.value)) {   
        alert('Nome inválido!');
        limparCampos(...[nomeAmigo]);
        return 0;
    }
    
    if (emailAmigo.value == '' || Array.from(listaAmigos.values()).includes(emailAmigo.value)) {   
        alert('E-mail inválido!');
        limparCampos(...[emailAmigo]);
        return 0;
    }

    return 1;

}

function enviarEmail(listaSorteio) {

    listaSorteio.forEach( sorteio => {        

        emailjs.send("service_iujm3jq","template_cktd387",{
            to_name: sorteio[0],
            message: sorteio[2],
            from_name: "AmigoSecreto.com",
            mail_to: sorteio[1],
            }).then(function (response) {
                console.log('SUCCESS!', response.status, response.text);
              }, function (error) {
                console.log('FAILED...', error);
              });

    });    
}

function downloadResultado() {

    const json = JSON.stringify(log);
    const blob = new Blob([json], {type: "application/json"});
    const link = document.createElement('a');
    link.classList.add('form__link')
    link.href = window.URL.createObjectURL(blob);
    link.textContent = "Download dos Resultados";
    link.download = "log.json";
    document.getElementById('download-resultados').appendChild(link);

}

function mostrarToolTip() {

    var mensagem = document.getElementById('tool-tip');

    if (listaAmigos.size > 0) {

        mensagem.classList.add('tooltiptext');
        mensagem.textContent = 'Clique sobre o amigo para removê-lo';        

    } else {

        mensagem.classList.remove('tooltiptext');
        limparCampos(mensagem);

    }


}

function importarExcel() {

    var excelFile = document.getElementById('excel-file');
    var reader = new FileReader();
    reader.readAsArrayBuffer(excelFile.files[0]);

    reader.onload = function() {

        var workBook = XLSX.read(new Uint8Array(reader.result), {type: 'array'});
        var sheetData = XLSX.utils.sheet_to_json(workBook.Sheets[workBook.SheetNames[0]], {header: 1})

        for (i = 1; i < sheetData.length; i++)
            listaAmigos.set(sheetData[i][0], sheetData[i][1]);

        atualizarLista();

    }       
    
    excelFile.value = '';

}