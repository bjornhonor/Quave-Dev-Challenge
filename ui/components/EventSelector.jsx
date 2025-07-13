// Importação do React para criação do componente
import React from 'react';

// Importação dos hooks específicos do Meteor para reatividade
// useSubscribe: gerencia inscrições em publicações do servidor
// useTracker: cria consultas reativas que se atualizam automaticamente
import { useSubscribe, useTracker } from 'meteor/react-meteor-data';

// Importação da collection Communities para realizar consultas reativas
// Esta collection contém todos os eventos/comunidades disponíveis
import { Communities } from '../../api/collections/communities.js';

/**
 * COMPONENTE: EventSelector
 * 
 * Componente responsável por exibir um dropdown (select) que permite ao usuário
 * escolher entre os eventos disponíveis no sistema.
 * 
 * RESPONSABILIDADES:
 * 1. Carregar dados de eventos do servidor de forma reativa
 * 2. Exibir lista de eventos em um dropdown estilizado
 * 3. Comunicar seleção do usuário para o componente pai
 * 4. Mostrar estados de loading enquanto dados são carregados
 * 5. Manter sincronia visual com o evento atualmente selecionado
 * 
 * REATIVIDADE:
 * - Automaticamente atualiza quando novos eventos são adicionados no servidor
 * - Reflete mudanças nos nomes dos eventos em tempo real
 * - Mantém estado visual consistente com os dados atuais
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Function} props.onSelectCommunity - Função callback chamada quando usuário seleciona um evento
 * @param {string|null} props.selectedCommunityId - ID do evento atualmente selecionado
 */
const EventSelector = ({ onSelectCommunity, selectedCommunityId }) => {
  
  /**
   * HOOK: useSubscribe
   * 
   * Gerencia a inscrição na publicação 'communities' do servidor.
   * 
   * Funcionamento:
   * - Faz inscrição automática na publicação 'communities' quando componente monta
   * - A publicação não requer parâmetros (todos os eventos são públicos)
   * - Cancela inscrição automaticamente quando componente é desmontado
   * - Retorna estado de loading da inscrição
   * 
   * Retorno:
   * - true: ainda carregando dados do servidor
   * - false: dados foram carregados e estão disponíveis
   * 
   * Esta inscrição garante que o componente tenha acesso aos dados
   * da collection Communities no lado cliente.
   */
  const isLoadingCommunities = useSubscribe('communities');

  /**
   * HOOK: useTracker
   * 
   * Cria uma consulta reativa que busca todos os eventos disponíveis.
   * 
   * Reatividade:
   * - A função é reexecutada automaticamente quando:
   *   a) Novos eventos são adicionados à collection
   *   b) Eventos existentes são modificados
   *   c) Eventos são removidos da collection
   * - Sempre retorna dados atualizados em tempo real
   * 
   * Consulta:
   * - Busca todos os documentos da collection Communities
   * - Ordena alfabeticamente por nome para melhor UX
   * - Converte cursor em array com .fetch()
   * 
   * Performance:
   * - A consulta só é executada quando há dados disponíveis
   * - Meteor otimiza automaticamente as atualizações
   */
  const communities = useTracker(() => {
    // Busca todos os eventos ordenados alfabeticamente por nome
    return Communities.find({}, { sort: { name: 1 } }).fetch();
  }, []); // Array vazio = não há dependências externas, só reatividade do Meteor

  /**
   * HANDLER: handleSelectChange
   * 
   * Função que processa a mudança de seleção no dropdown.
   * 
   * Fluxo:
   * 1. Usuário seleciona uma opção no dropdown
   * 2. Evento onChange é disparado
   * 3. Esta função extrai o valor selecionado
   * 4. Chama a função callback do componente pai
   * 5. Componente pai atualiza seu estado
   * 6. Toda a aplicação reage à mudança
   * 
   * @param {Event} event - Evento do onChange do elemento select
   */
  const handleSelectChange = (event) => {
    // Extrai o valor selecionado do evento
    const selectedValue = event.target.value;
    
    // Converte string vazia para null (quando "Selecione um evento" está selecionado)
    // Isso mantém consistência com o tipo esperado pelo componente pai
    const communityId = selectedValue === '' ? null : selectedValue;
    
    // Chama a função callback passada pelo componente pai
    // Isso permite que o componente pai atualize seu estado
    onSelectCommunity(communityId);
  };

  /**
   * RENDERIZAÇÃO CONDICIONAL: Estado de Loading
   * 
   * Enquanto os dados ainda estão sendo carregados do servidor,
   * exibe um elemento select desabilitado com mensagem de loading.
   * 
   * UX: Fornece feedback visual imediato ao usuário
   * Performance: Evita renderizar lista vazia enquanto carrega
   */
  if (isLoadingCommunities) {
    return (
      <div className="flex flex-col space-y-2">
        {/* Label para acessibilidade e UX */}
        <label htmlFor="event-selector" className="block text-sm font-medium text-gray-700">
          Selecionar Evento
        </label>
        
        {/* Select desabilitado durante loading */}
        <select 
          id="event-selector"
          disabled 
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed"
        >
          <option>Carregando eventos...</option>
        </select>
        
        {/* Indicador visual adicional de loading */}
        <p className="text-xs text-gray-500">
          Buscando eventos disponíveis no servidor...
        </p>
      </div>
    );
  }

  /**
   * RENDERIZAÇÃO PRINCIPAL: Dropdown de Eventos
   * 
   * Renderiza o dropdown completo com todos os eventos carregados.
   * Inclui opção padrão e mapeia todos os eventos da collection.
   */
  return (
    <div className="flex flex-col space-y-2">
      {/* Label semântico para acessibilidade */}
      <label htmlFor="event-selector" className="block text-sm font-medium text-gray-700">
        Selecionar Evento
      </label>
      
      {/* 
        SELECT PRINCIPAL
        
        Estilização TailwindCSS:
        - w-full: largura total do container
        - px-3 py-2: padding interno confortável
        - border border-gray-300: borda sutil
        - rounded-md: bordas arredondadas modernas
        - shadow-sm: sombra sutil para profundidade
        - focus:ring-blue-500: anel azul no foco (acessibilidade)
        - focus:border-blue-500: borda azul no foco
        - text-gray-900: texto escuro legível
        - bg-white: fundo branco limpo
      */}
      <select
        id="event-selector"
        value={selectedCommunityId || ''} // Converte null para string vazia
        onChange={handleSelectChange}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
      >
        {/* 
          OPÇÃO PADRÃO
          
          - value="": valor vazio para representar "nenhuma seleção"
          - disabled: não pode ser selecionada após escolher outro evento
          - Texto explicativo para orientar o usuário
        */}
        <option value="" disabled>
          Selecione um evento
        </option>
        
        {/* 
          MAPEAMENTO DOS EVENTOS
          
          Para cada evento na collection Communities:
          1. Cria uma <option> com value igual ao _id do evento
          2. Exibe o name do evento como texto visível
          3. key={_id} para otimização do React
          
          Reatividade: Quando events mudam, o map é reexecutado
          automaticamente e a lista é atualizada na interface
        */}
        {communities.map((community) => (
          <option key={community._id} value={community._id}>
            {community.name}
          </option>
        ))}
      </select>
      
      {/* 
        INFORMAÇÃO CONTEXTUAL
        
        Exibe quantos eventos estão disponíveis para ajudar o usuário
        a entender o escopo das opções disponíveis
      */}
      <p className="text-xs text-gray-500">
        {communities.length > 0 
          ? `${communities.length} evento${communities.length > 1 ? 's' : ''} disponível${communities.length > 1 ? 'eis' : ''}`
          : 'Nenhum evento encontrado'
        }
      </p>
    </div>
  );
};

// Exportação padrão do componente para uso em outras partes da aplicação
export default EventSelector;