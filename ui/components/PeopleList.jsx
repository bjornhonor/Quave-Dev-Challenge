// Importação do React e hooks necessários
// useEffect: para gerenciar efeitos colaterais (timer de reatividade)
// useState: para forçar re-renderizações quando necessário
import React, { useEffect, useState } from 'react';

// Importação do Meteor para chamar methods do servidor
// Usado para executar check-in e check-out via methods seguros
import { Meteor } from 'meteor/meteor';

/**
 * FUNÇÃO AUXILIAR: formatDate
 * 
 * Formata uma data no padrão MM/DD/YYYY, HH:mm ou retorna 'N/A' se a data for nula.
 * 
 * Lógica:
 * - Se date for null/undefined, retorna 'N/A'
 * - Se date for válida, formata usando métodos nativos do JavaScript
 * - Adiciona zeros à esquerda quando necessário para manter formato consistente
 * 
 * @param {Date|null|undefined} date - Data a ser formatada
 * @returns {string} Data formatada ou 'N/A'
 */
const formatDate = (date) => {
  // Verifica se a data existe e é válida
  if (!date || !(date instanceof Date)) {
    return 'N/A';
  }

  // Extrai componentes da data
  const month = (date.getMonth() + 1).toString().padStart(2, '0'); // +1 porque getMonth() retorna 0-11
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  // Retorna no formato MM/DD/YYYY, HH:mm
  return `${month}/${day}/${year}, ${hours}:${minutes}`;
};

/**
 * FUNÇÃO AUXILIAR: getTimeDifferenceInSeconds
 * 
 * Calcula a diferença em segundos entre uma data e o momento atual.
 * Usado para determinar se já passaram 5 segundos desde o check-in.
 * 
 * @param {Date} date - Data de referência (checkInDate)
 * @returns {number} Diferença em segundos
 */
const getTimeDifferenceInSeconds = (date) => {
  if (!date || !(date instanceof Date)) {
    return 0;
  }
  
  // Calcula diferença entre agora e a data fornecida em milissegundos
  const diffInMs = new Date() - date;
  
  // Converte para segundos
  return Math.floor(diffInMs / 1000);
};

/**
 * COMPONENTE: PeopleList
 * 
 * Componente responsável por exibir a lista de participantes de um evento
 * e permitir operações de check-in e check-out.
 * 
 * RESPONSABILIDADES:
 * 1. Exibir lista de participantes com informações detalhadas
 * 2. Formatar datas de check-in e check-out adequadamente
 * 3. Implementar lógica condicional para botões de ação
 * 4. Gerenciar reatividade temporal (botão de check-out após 5 segundos)
 * 5. Executar methods do Meteor para check-in/check-out
 * 6. Fornecer feedback visual do status de cada participante
 * 
 * REATIVIDADE TEMPORAL:
 * - Usa timer para re-renderizar a cada segundo
 * - Permite que botão de check-out apareça exatamente após 5 segundos
 * - Atualiza contadores visuais em tempo real
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.people - Array de objetos representando participantes
 */
const PeopleList = ({ people }) => {
  
  /**
   * ESTADO LOCAL: forceUpdate
   * 
   * Estado usado exclusivamente para forçar re-renderizações do componente.
   * Como a lógica do botão de check-out depende de tempo (5 segundos),
   * precisamos re-renderizar regularmente para atualizar a interface.
   * 
   * A cada segundo, incrementamos este valor para triggerar nova renderização.
   */
  const [forceUpdate, setForceUpdate] = useState(0);

  /**
   * EFEITO: Timer de Reatividade
   * 
   * Implementa um timer que executa a cada segundo para forçar re-renderização.
   * Isso é necessário para a funcionalidade do botão de check-out que deve
   * aparecer exatamente 5 segundos após o check-in.
   * 
   * FUNCIONAMENTO:
   * 1. setInterval executa função a cada 1000ms (1 segundo)
   * 2. Função incrementa o estado forceUpdate
   * 3. Mudança no estado força nova renderização do componente
   * 4. Nova renderização recalcula condições dos botões
   * 5. Botão de check-out aparece/desaparece conforme tempo decorrido
   * 
   * CLEANUP:
   * - clearInterval é chamado quando componente é desmontado
   * - Previne memory leaks e execuções desnecessárias
   */
  useEffect(() => {
    // Cria interval que executa a cada segundo
    const interval = setInterval(() => {
      // Incrementa contador para forçar re-renderização
      setForceUpdate(prev => prev + 1);
    }, 1000);

    // Função de cleanup: remove o interval quando componente é desmontado
    // ou quando dependências do useEffect mudam
    return () => clearInterval(interval);
  }, []); // Array vazio = efeito só executa no mount/unmount

  /**
   * HANDLER: handleCheckIn
   * 
   * Executa check-in de um participante chamando method do servidor.
   * 
   * @param {string} personId - ID da pessoa que está fazendo check-in
   */
  const handleCheckIn = async (personId) => {
    try {
      // Chama method assíncrono do servidor para realizar check-in
      await Meteor.callAsync('people.checkIn', personId);
      console.log(`Check-in realizado para pessoa ${personId}`);
    } catch (error) {
      // Tratamento de erro: exibe mensagem no console e poderia mostrar toast/alert
      console.error('Erro ao fazer check-in:', error);
      alert('Erro ao realizar check-in: ' + error.reason);
    }
  };

  /**
   * HANDLER: handleCheckOut
   * 
   * Executa check-out de um participante chamando method do servidor.
   * 
   * @param {string} personId - ID da pessoa que está fazendo check-out
   */
  const handleCheckOut = async (personId) => {
    try {
      // Chama method assíncrono do servidor para realizar check-out
      await Meteor.callAsync('people.checkOut', personId);
      console.log(`Check-out realizado para pessoa ${personId}`);
    } catch (error) {
      // Tratamento de erro: exibe mensagem no console e poderia mostrar toast/alert
      console.error('Erro ao fazer check-out:', error);
      alert('Erro ao realizar check-out: ' + error.reason);
    }
  };

  /**
   * FUNÇÃO: renderActionButton
   * 
   * Renderiza o botão de ação apropriado baseado no status do participante.
   * 
   * LÓGICA CONDICIONAL:
   * 1. Se não fez check-in: botão "Check-in {nome}"
   * 2. Se fez check-in mas não check-out:
   *    a) Se < 5 segundos: botão desabilitado "Aguarde..."
   *    b) Se >= 5 segundos: botão "Check-out {nome}"
   * 3. Se fez check-out: texto informativo "Check-out realizado"
   * 
   * @param {Object} person - Objeto da pessoa
   * @returns {JSX.Element} Elemento JSX do botão ou texto
   */
  const renderActionButton = (person) => {
    const fullName = `${person.firstName} ${person.lastName}`;
    
    // CASO 1: Não fez check-in ainda
    if (!person.checkInDate) {
      return (
        <button
          onClick={() => handleCheckIn(person._id)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Check-in {fullName}
        </button>
      );
    }
    
    // CASO 2: Fez check-in mas ainda não fez check-out
    if (person.checkInDate && !person.checkOutDate) {
      // Calcula tempo decorrido desde o check-in
      const secondsSinceCheckIn = getTimeDifferenceInSeconds(person.checkInDate);
      
      // SUBCASO 2a: Menos de 5 segundos - botão desabilitado
      if (secondsSinceCheckIn < 5) {
        const remainingSeconds = 5 - secondsSinceCheckIn;
        return (
          <button
            disabled
            className="px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed opacity-60"
          >
            Aguarde... ({remainingSeconds}s)
          </button>
        );
      }
      
      // SUBCASO 2b: 5 segundos ou mais - botão de check-out habilitado
      return (
        <button
          onClick={() => handleCheckOut(person._id)}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
        >
          Check-out {fullName}
        </button>
      );
    }
    
    // CASO 3: Já fez check-out - apenas texto informativo
    return (
      <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md border">
        Check-out realizado
      </span>
    );
  };

  /**
   * RENDERIZAÇÃO CONDICIONAL: Lista Vazia
   * 
   * Se não há participantes, exibe mensagem amigável orientando o usuário.
   */
  if (!people || people.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          {/* Ícone SVG para comunicação visual */}
          <svg 
            className="mx-auto h-12 w-12 text-gray-400 mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" 
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum participante encontrado
          </h3>
          <p className="text-gray-500">
            Selecione um evento para ver os participantes ou verifique se há pessoas registradas neste evento.
          </p>
        </div>
      </div>
    );
  }

  /**
   * RENDERIZAÇÃO PRINCIPAL: Lista de Participantes
   * 
   * Renderiza cards estilizados para cada participante com todas as informações
   * e botões de ação apropriados.
   */
  return (
    <div className="space-y-4">
      {/* Cabeçalho da seção */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Participantes do Evento
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {people.length} participante{people.length > 1 ? 's' : ''} registrado{people.length > 1 ? 's' : ''}
        </p>
      </div>

      {/* Lista de participantes - usando grid responsivo */}
      <div className="grid gap-4 md:gap-6">
        {people.map((person) => (
          <div 
            key={person._id} 
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Layout do card usando flexbox responsivo */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              
              {/* Informações da pessoa */}
              <div className="flex-1 space-y-2">
                {/* Nome completo - destaque principal */}
                <h3 className="text-lg font-semibold text-gray-900">
                  {person.firstName} {person.lastName}
                </h3>
                
                {/* Informações profissionais */}
                <div className="text-sm text-gray-600 space-y-1">
                  {/* Empresa - só exibe se existe */}
                  {person.companyName && (
                    <p>
                      <span className="font-medium">Empresa:</span> {person.companyName}
                    </p>
                  )}
                  
                  {/* Cargo - só exibe se existe */}
                  {person.title && (
                    <p>
                      <span className="font-medium">Cargo:</span> {person.title}
                    </p>
                  )}
                </div>
                
                {/* Status de check-in/check-out */}
                <div className="text-sm space-y-1">
                  {/* Data de check-in */}
                  <p className="text-gray-600">
                    <span className="font-medium">Check-in:</span>{' '}
                    <span className={person.checkInDate ? 'text-green-600' : 'text-gray-400'}>
                      {formatDate(person.checkInDate)}
                    </span>
                  </p>
                  
                  {/* Data de check-out */}
                  <p className="text-gray-600">
                    <span className="font-medium">Check-out:</span>{' '}
                    <span className={person.checkOutDate ? 'text-red-600' : 'text-gray-400'}>
                      {formatDate(person.checkOutDate)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Área de ação - botões */}
              <div className="flex-shrink-0">
                {renderActionButton(person)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Exportação padrão do componente para uso em outras partes da aplicação
export default PeopleList;