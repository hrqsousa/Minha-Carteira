# Changelog

## v2.0.2 (14/01/2026)
### 🎨 Design & UI
- **Nova Barra de Navegação**: Design flutuante estilo "cápsula" na versão mobile com efeito glassmorphism apurado.
- **Visual Minimalista**: Ícones ampliados e remoção de legendas na barra inferior para uma estética mais limpa.
- **Layout Refinado**: Ajuste de padding e posicionamento do FAB para harmonizar com a nova navegação.

### 🐛 Correções & Ajustes
- **Saldo na Dashboard**: Ajuste no tamanho da fonte para evitar quebra de linha em telas mobile, garantindo visualização em linha única.
- **Formulário de Transação**: Correção no layout dos campos "Valor" e "Data" em dispositivos móveis, ajustando proporções para evitar que a data fique oculta.

## v2.0.1 (06/01/2026)
### ✨ Novidades
- **Edição Inteligente de Lotes**: Agora ao editar uma transação recorrente ou parcelada, você pode escolher aplicar a mudança apenas nela, nela e nas futuras ou em todas da série.
- **Datas Dinâmicas**: Alterar a data de uma parcela ajusta automaticamente as datas das parcelas subsequentes.
- **Gráfico de Rosca**: Nova visualização na Dashboard para distribuição de gastos por Método de Pagamento (Cartões).

### 🎨 Melhorias Visuais
- **Setas Indicativas**: Substituído o texto "Próx. Mês" por setas discretas na lista de transações para indicar lançamentos diferidos.
- **Limpeza Visual**: O número da parcela (ex: 1/12) agora aparece apenas na tag, removendo a duplicação no nome da transação.
- **Datas em Minúsculo**: Ajuste nos cabeçalhos de data (ex: "20 de janeiro") para um visual mais limpo.
- **Formatação de Moeda**: Correção na Dashboard para exibir estritamente duas casas decimais nos valores.

---

# Changelog - Minha Carteira v2.0.0

## ✨ Destaques
- **Visual Renovado**: Interface moderna e fluida, com design responsivo, animações de transição de página e suporte nativo a **Dark Mode** com efeito Glassmorphism premium.
- **PWA Completo**: Instale o app diretamente no seu celular ou desktop. Funciona como um aplicativo nativo, sem barras de navegador.

## 🚀 Principais Funcionalidades

### 📊 Dashboard & Visão Geral
- **Resumo Financeiro**: Cards elegantes mostrando Saldo Total, Receitas e Despesas do mês.
- **Gráfico Interativo**: Visualize a evolução do seu saldo nos últimos 6 meses.
- **Atalhos Rápidos**: Botão flutuante (FAB) para adicionar transações de qualquer lugar.

### 💰 Gestão de Transações (Extrato)
- **Extrato Detalhado**: Lista completa de receitas e despesas, agrupadas por dia.
- **Filtros Inteligentes**: Navegue facilmente por meses anteriores e filtre por Métodos de Pagamento.
- **Edição & Exclusão**: Modifique ou remova lançamentos com um toque (ou clique).
- **Recorrência**: Suporte a transações fixas e parceladas.

### ⚙️ Gestão & Configurações
- **Meios de Pagamento**: Cadastre e gerencie seus bancos e cartões (ícones automáticos).
- **Responsáveis**: Controle quem gastou o que (opcional).
- **Dados na Nuvem**: Sincronização em tempo real com Firebase Firestore (seus dados salvos e seguros).
- **Segurança**: Login seguro com Google.

## 🎨 Melhorias de UI/UX
- **Glassmorphism**: Barra lateral e menus com efeito de vidro fosco (blur).
- **Feedback Visual**: Cores intuitivas para entradas (verde) e saídas (vermelho).
- **Animações Suaves**: Transições agradáveis ao navegar entre telas ou abrir modais.
