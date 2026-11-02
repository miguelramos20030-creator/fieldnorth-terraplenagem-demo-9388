export const services = [
  {
    title: "Terraplenagem e nivelamento",
    choice: "Terraplenagem e nivelamento",
    image: "br-terrain",
    alt: "Solo exposto e acesso em uma área de obra, fotografia ilustrativa",
    description:
      "Preparação e regularização de áreas, conforme as condições do terreno e o objetivo do projeto.",
  },
  {
    title: "Escavação e abertura de valas",
    choice: "Escavação e valas",
    image: "br-excavation",
    alt: "Miniescavadeira em uma escavação junto a uma obra, fotografia ilustrativa",
    description:
      "Escavações localizadas e abertura de valas, com escolha do equipamento e planejamento conforme o espaço de trabalho.",
  },
  {
    title: "Máquinas compactas com operador",
    choice: "Máquina com operador",
    image: "br-loader",
    alt: "Minicarregadeira sobre solo aberto em área de obra, fotografia ilustrativa",
    description:
      "Uma alternativa para serviços que pedem equipamentos menores e operação acompanhada. A adequação depende do acesso, do solo e do tipo de trabalho.",
  },
];
export const machines = [
  {
    title: "Miniescavadeira",
    image: "br-excavator",
    alt: "Miniescavadeira compacta em terreno gramado, fotografia ilustrativa",
    description: "para escavações localizadas e valas, conforme o acesso e a necessidade.",
  },
  {
    title: "Minicarregadeira",
    image: "br-loader",
    alt: "Minicarregadeira em terreno de obra com solo exposto, fotografia ilustrativa",
    description: "para movimentação de material e preparação de áreas, conforme a operação.",
  },
];
export const scenarios = [
  {
    title: "Preparação de terreno",
    description:
      "Organizar a área de trabalho e avaliar a regularização do solo para o próximo uso.",
    image: "br-terrain",
    alt: "Área de solo exposto e via de acesso, aplicação ilustrativa de preparação de terreno",
    service: 0,
  },
  {
    title: "Abertura de acesso",
    description:
      "Planejar a entrada de máquinas e a movimentação de material conforme as condições do local.",
    image: "br-loader",
    alt: "Máquina compacta em área aberta, aplicação ilustrativa de acesso ao terreno",
    service: 2,
  },
  {
    title: "Escavação localizada",
    description:
      "Definir onde escavar, considerando o espaço disponível e a finalidade do trabalho.",
    image: "br-excavation",
    alt: "Miniescavadeira junto ao solo escavado, aplicação ilustrativa de escavação localizada",
    service: 1,
  },
];
export const processSteps = [
  ["Conte o que precisa fazer.", "Selecione o serviço e descreva o objetivo do trabalho."],
  [
    "Mostre as condições do local.",
    "Informe cidade, acesso e área aproximada, se souber. Fotos podem ser combinadas no atendimento real.",
  ],
  [
    "Defina os próximos passos.",
    "A necessidade de visita, o equipamento e o orçamento são definidos após avaliar o pedido e o terreno.",
  ],
];
export const faqs = [
  [
    "Como o orçamento é definido?",
    "Pelo tipo de serviço, condições do terreno, acesso e equipamento necessário. Pode ser preciso avaliar o local antes de fechar o valor.",
  ],
  [
    "Preciso saber a medida exata?",
    "Não para iniciar a conversa. Uma estimativa e a descrição do objetivo ajudam a entender o pedido.",
  ],
  [
    "A locação inclui operador?",
    "O conceito deste demo é de máquinas com operador. No site de uma empresa real, a condição deve refletir o serviço oferecido.",
  ],
  [
    "Qual máquina devo escolher?",
    "Depende do espaço, do solo e do trabalho. Se estiver em dúvida, selecione “Ainda não sei”.",
  ],
  [
    "Este formulário envia uma solicitação?",
    "Não. Ele demonstra a experiência de orçamento e permite copiar um resumo, sem enviar ou armazenar dados.",
  ],
];
