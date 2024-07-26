const fs = require('fs');
const nodemailer = require('nodemailer');
//Consumir dados a partir do link
const data = async () => {
  const response = await fetch(`https://case-1sbzivi17-henriques-projects-2cf452dc.vercel.app/`);
  const json = await response.json();
  return json;
};
//Criar Geradores
function configurarGeradores() {
  const geradores = [];

  // Agrupar produtos por categoria
  const paineis = produtos.filter(p => p.Categoria === "Painel Solar");
  const controladores = produtos.filter(p => p.Categoria === "Controlador de carga");
  const inversores = produtos.filter(p => p.Categoria === "Inversor");

  // Configurar geradores com um painel
  paineis.forEach(painel => {
    const potenciaNecessaria = painel['Potencia em W'];
    const controlador = controladores.find(c => c['Potencia em W'] === potenciaNecessaria);
    const inversor = inversores.find(i => i['Potencia em W'] === potenciaNecessaria);
    if (controlador && inversor) {
      geradores.push({
        Painel: painel,
        Controlador: controlador,
        Inversor: inversor
      });
    }
  });
  

  // Configurar geradores com dois paineis
  paineis.forEach((painel) => {
    const painelPar = paineis.find(p => p.Produto === painel.Produto);
    if (painelPar) {
      const potenciaCombinada = painel['Potencia em W'] + painelPar['Potencia em W'];
      const controlador = controladores.find(c => c['Potencia em W'] >= potenciaCombinada);
      const inversor = inversores.find(i => i['Potencia em W'] === potenciaCombinada);
      if (controlador && inversor) {
        geradores.push({
          Painel: painel,
          Painel2: painelPar,
          Controlador: controlador,
          Inversor: inversor
        });
      }
    }
  });
  return geradores;
}

//Criar tabela com as informações dos geradores
function criarTabelaGeradores(geradores) {
  const tabela = [];
  let idGerador = 10000;

  geradores.forEach(gerador => {
      const painel = gerador.Painel;
      const painel2 = gerador.Painel2;
      const controlador = gerador.Controlador;
      const inversor = gerador.Inversor;

      // Adiciona o componente Painel2 (se existir) à tabela
      if (painel2) {
          tabela.push([idGerador, painel2['Potencia em W']*2, painel2.Id, painel2.Produto, 2]);
      }

      else {
        tabela.push([idGerador, painel['Potencia em W'], painel.Id, painel.Produto, 1]);
    }

      tabela.push([idGerador, controlador['Potencia em W'], controlador.Id, controlador.Produto, 1]);

      tabela.push([idGerador, inversor['Potencia em W'], inversor.Id, inversor.Produto, 1]);

      idGerador++;

  });

  return tabela;
}

let produtos = [];

data().then((result) => {
  result.forEach((item) => {
      produtos.push(item);
  });

  //Chama função com os geradores configurados
  const geradoresConfigurados = configurarGeradores();

  // Chama função com tabela criada
  const tabelaGeradores = criarTabelaGeradores(geradoresConfigurados);

  //Contagem de quantos geradores foram criados
  let sizearray = tabelaGeradores.length-1
  let qntGeradores = ((tabelaGeradores[sizearray][0])-9999)

  //Cria o arquivo csv
  const csvContent = tabelaGeradores.map(row => row.join(',')).join('\n');
fs.writeFileSync('geradores.csv', 'ID Gerador,Potência do Gerador (em W),ID do Produto,Nome do Produto,Quantidade Item\n' + csvContent);



// Configurações do nodemailer
const transporter = nodemailer.createTransport({
  service: 'neosolar.', 
  auth: {
      user: 'criadorgeradores@neosolar.com.br',
      pass: 'Cr14d0rG3r4d0r'
  }
});

// Envia o email
const mailOptions = {
  from: 'criadorgeradores@neosolar.com.br',
  to: 'marketing@neosolar.com.br',
  subject: `Relatório de Geradores - Total de Geradores: ${qntGeradores}`,
  text: `Segue em anexo o arquivo CSV com o relatório dos geradores configurados. Foram configurados ${qntGeradores} geradores.`,
  attachments: [
      {
          filename: 'geradores.csv',
          path: './geradores.csv'
      }
  ]
};

transporter.sendMail(mailOptions, function(error, info) {
  if (error) {
      console.log(error);
  } else {
      console.log('Email enviado: ' + info.response);
  }
});

  

}).catch((error) => {
  console.error("Erro ao buscar os dados:", error);
});


  