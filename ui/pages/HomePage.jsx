// Importação do React e do hook useState para gerenciamento de estado local
// useState permite que o componente mantenha estado interno (evento selecionado)
import React, { useState } from 'react';

// Importação dos hooks específicos do Meteor para reatividade
// useSubscribe: gerencia inscrições em publicações do servidor
// useTracker: cria consultas reativas que se atualizam automaticamente
import { useSubscribe, useTracker } from 'meteor/react-meteor-data';

// Importação da collection People para realizar consultas reativas
// Esta collection contém todos os participantes dos eventos
import { People } from '../../api/collections/people.js';

// Importação dos componentes filhos que compõem a interface
// Estes componentes serão criados posteriormente e renderizados nesta página
import EventSelector from '../components/EventSelector.jsx';
import EventSummary from '../components/EventSummary.jsx';
import PeopleList from '../components/PeopleList.jsx';

/**
 * COMPONENTE PRINCIPAL: HomePage
 * 
 * Este é o componente raiz da aplicação de check-in de eventos.
 * Ele coordena todos os outros componentes e gerencia o estado global
 * da aplicação, incluindo qual evento está selecionado atualmente.
 * 
 * RESPONSABILIDADES:
 * 1. Gerenciar o estado do evento selecionado (selectedCommunityId)
 * 2. Coordenar a comunicação entre componentes filhos via props
 * 3. Gerenciar inscrições reativas nas publicações do Meteor
 * 4. Fornecer dados atualizados em tempo real para os componentes
 * 5. Definir o layout principal e estilo visual da aplicação
 * 
 * ARQUITETURA:
 * - Usa padrão de "container component" - gerencia dados e estado
 * - Passa dados e callbacks para componentes apresentacionais
 * - Aproveita a reatividade do Meteor para atualizações automáticas
 */
const HomePage = () => {
  /**
   * ESTADO LOCAL: selectedCommunityId
   * 
   * Armazena o ID do evento/comunidade atualmente selecionado pelo usuário.
   * 
   * Estados possíveis:
   * - null: Nenhum evento selecionado (estado inicial)
   * - string: ID do evento selecionado
   * 
   * Este estado é a "fonte da verdade" para qual evento está sendo visualizado
   * e influencia quais dados são carregados e exibidos em toda a aplicação.
   */
  const [selectedCommunityId, setSelectedCommunityId] = useState(null);

  /**
   * HOOK: useSubscribe
   * 
   * Gerencia a inscrição na publicação 'people' do servidor.
   * 
   * Funcionamento:
   * - Se selectedCommunityId for null, não faz inscrição (evita carregar dados desnecessários)
   * - Se selectedCommunityId tiver valor, inscreve na publicação passando o ID como parâmetro
   * - A inscrição é automaticamente cancelada quando o componente é desmontado
   * - Mudanças no selectedCommunityId automaticamente atualizam a inscrição
   * 
   * Performance:
   * - Evita carregar dados quando nenhum evento está selecionado
   * - Cancela inscrições antigas automaticamente ao trocar eventos
   * - Otimiza uso de banda e recursos do servidor
   */
  const isLoadingPeople = useSubscribe('people', selectedCommunityId);

  /**
   * HOOK: useTracker
   * 
   * Cria uma consulta reativa que busca pessoas do evento selecionado.
   * 
   * Reatividade:
   * - A função é reexecutada automaticamente quando:
   *   a) selectedCommunityId muda (usuário seleciona outro evento)
   *   b) Dados na collection People mudam (check-ins, check-outs, etc.)
   * - Retorna sempre dados atualizados em tempo real
   * 
   * Lógica:
   * - Se não há evento selecionado, retorna array vazio
   * - Se há evento selecionado, busca todas as pessoas desse evento
   * - O resultado é automaticamente atualizado quando dados mudam
   */
  const people = useTracker(() => {
    // Se nenhum evento está selecionado, não há pessoas para mostrar
    if (!selectedCommunityId) {
      return [];
    }
    
    // Busca todas as pessoas do evento selecionado
    // A consulta é filtrada pelo communityId e ordenada alfabeticamente por nome
    return People.find(
      { communityId: selectedCommunityId },
      { sort: { firstName: 1, lastName: 1 } } // Ordenação alfabética
    ).fetch();
  }, [selectedCommunityId]); // Dependência: reexecuta quando selectedCommunityId muda

  /**
   * RENDERIZAÇÃO DO COMPONENTE
   * 
   * Layout:
   * - Container full-height com fundo cinza claro
   * - Layout flexível vertical (flex-col)
   * - Container centralizado com largura máxima
   * - Espaçamento consistente entre elementos
   * - Design responsivo e moderno
   */
  return (
    // Container principal: ocupa altura total da tela com fundo cinza claro
    <div className="min-h-screen bg-gray-100">
      {/* Container centralizado com largura máxima e padding responsivo */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Layout flexível vertical com espaçamento entre elementos */}
        <div className="flex flex-col space-y-8">
          
          {/* CABEÇALHO: Título principal da aplicação */}
          <header className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">
              Quave Event Check-in
            </h1>
            {/* Subtítulo explicativo */}
            <p className="text-lg text-gray-600">
              Sistema de gerenciamento de presença em eventos
            </p>
          </header>

          {/* SELETOR DE EVENTOS */}
          {/* 
            Componente responsável por exibir dropdown de eventos e permitir seleção.
            Props:
            - selectedCommunityId: evento atualmente selecionado
            - setSelectedCommunityId: função para atualizar evento selecionado
          */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <EventSelector 
              selectedCommunityId={selectedCommunityId}
              setSelectedCommunityId={setSelectedCommunityId}
            />
          </div>

          {/* CONTEÚDO CONDICIONAL: Só exibe se um evento estiver selecionado */}
          {selectedCommunityId && (
            <>
              {/* RESUMO DO EVENTO */}
              {/* 
                Componente que exibe estatísticas do evento selecionado.
                Props:
                - selectedCommunityId: ID do evento para calcular estatísticas
                - people: lista de pessoas para gerar contadores e métricas
              */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <EventSummary 
                  selectedCommunityId={selectedCommunityId}
                  people={people}
                />
              </div>

              {/* LISTA DE PARTICIPANTES */}
              {/* 
                Componente que exibe lista de pessoas e permite check-in/check-out.
                Props:
                - selectedCommunityId: ID do evento (para contexto)
                - people: lista completa de participantes com dados atualizados
              */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <PeopleList 
                  selectedCommunityId={selectedCommunityId}
                  people={people}
                />
              </div>
            </>
          )}

          {/* ESTADO INICIAL: Mensagem quando nenhum evento está selecionado */}
          {!selectedCommunityId && (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <div className="text-gray-500">
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
                    d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4" 
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Selecione um evento
                </h3>
                <p className="text-gray-500">
                  Escolha um evento no seletor acima para visualizar os participantes e gerenciar check-ins.
                </p>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

// Exportação padrão do componente para uso em outras partes da aplicação
export default HomePage;