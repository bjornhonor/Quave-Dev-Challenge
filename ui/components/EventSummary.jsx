// Importação do React para criação do componente
import React from 'react';

/**
 * COMPONENTE: EventSummary
 * 
 * Componente responsável por calcular e exibir estatísticas em tempo real
 * sobre o status dos participantes de um evento.
 * 
 * RESPONSABILIDADES:
 * 1. Calcular pessoas atualmente presentes no evento
 * 2. Agrupar pessoas presentes por empresa
 * 3. Calcular pessoas que ainda não fizeram check-in
 * 4. Exibir estatísticas de forma clara e visual
 * 5. Atualizar automaticamente conforme dados mudam (reatividade)
 * 
 * CÁLCULOS REALIZADOS:
 * - Filtros com condições específicas de check-in/check-out
 * - Agrupamento usando reduce para contar por empresa
 * - Formatação de strings para exibição user-friendly
 * 
 * @param {Object} props - Propriedades do componente
 * @param {Array} props.people - Array de objetos representando participantes
 */
const EventSummary = ({ people }) => {
  
  /**
   * VALIDAÇÃO: Verificar se existem dados para processar
   * 
   * Se não há pessoas registradas, não há estatísticas para calcular.
   * Retorna null para não renderizar nada (componente vazio).
   */
  if (!people || people.length === 0) {
    return null;
  }

  /**
   * CÁLCULO 1: Pessoas atualmente no evento
   * 
   * Critério: pessoas que fizeram check-in mas ainda não fizeram check-out
   * - checkInDate deve existir (não nulo)
   * - checkOutDate deve ser nulo (ainda não saíram)
   * 
   * Lógica:
   * - filter() cria novo array apenas com pessoas que atendem critério
   * - !! converte para boolean (elimina valores falsy)
   * - length conta quantas pessoas atendem critério
   */
  const peopleCurrentlyPresent = people.filter(person => 
    !!person.checkInDate && !person.checkOutDate
  );
  const currentlyPresentCount = peopleCurrentlyPresent.length;

  /**
   * CÁLCULO 2: Agrupamento por empresa das pessoas presentes
   * 
   * Objetivo: contar quantas pessoas de cada empresa estão atualmente no evento
   * 
   * Processo:
   * 1. Pega apenas pessoas atualmente presentes (do cálculo anterior)
   * 2. Usa reduce() para agrupar e contar por empresa
   * 3. Trata casos onde companyName pode ser null/undefined
   * 4. Retorna objeto no formato: { "Empresa A": 3, "Empresa B": 2 }
   */
  const companiesPresent = peopleCurrentlyPresent.reduce((acc, person) => {
    // Define nome da empresa, usando 'Sem empresa' como fallback
    // Isso garante que pessoas sem empresa sejam contabilizadas
    const company = person.companyName || 'Sem empresa';
    
    // Se empresa já existe no acumulador, incrementa contador
    // Se não existe, inicia com 1
    acc[company] = (acc[company] || 0) + 1;
    
    return acc;
  }, {}); // Objeto vazio como valor inicial

  /**
   * CÁLCULO 3: Pessoas que ainda não fizeram check-in
   * 
   * Critério: pessoas onde checkInDate é nulo
   * 
   * Lógica:
   * - filter() encontra pessoas sem check-in
   * - !person.checkInDate identifica valores nulos/undefined
   * - length conta quantas pessoas ainda não entraram
   */
  const peopleNotCheckedIn = people.filter(person => !person.checkInDate);
  const notCheckedInCount = peopleNotCheckedIn.length;

  /**
   * FORMATAÇÃO: String de empresas presentes
   * 
   * Converte objeto de empresas em string legível para exibição.
   * Formato final: "Empresa A (3), Empresa B (2), Sem empresa (1)"
   * 
   * Processo:
   * 1. Object.entries() converte objeto em array de [nome, count]
   * 2. map() formata cada entrada como "Nome (quantidade)"
   * 3. join(', ') une tudo com vírgulas
   * 4. Se vazio, exibe mensagem apropriada
   */
  const formatCompaniesPresent = () => {
    const entries = Object.entries(companiesPresent);
    
    // Se não há empresas (ninguém presente), retorna mensagem vazia
    if (entries.length === 0) {
      return 'Nenhuma empresa presente';
    }
    
    // Formata cada empresa e junta com vírgulas
    return entries
      .map(([company, count]) => `${company} (${count})`)
      .join(', ');
  };

  /**
   * RENDERIZAÇÃO: Cards de estatísticas
   * 
   * Layout responsivo com três cards principais mostrando as métricas calculadas.
   * Cada card tem cor e ícone específicos para facilitar identificação visual.
   */
  return (
    <div className="space-y-6">
      
      {/* Cabeçalho da seção */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Resumo do Evento
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Estatísticas em tempo real dos participantes
        </p>
      </div>

      {/* Grid responsivo de cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* CARD 1: Pessoas atualmente presentes */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center">
            {/* Ícone de pessoas presentes */}
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            
            {/* Conteúdo do card */}
            <div className="ml-4">
              <p className="text-sm font-medium text-green-600">
                Pessoas no evento agora
              </p>
              <p className="text-2xl font-bold text-green-900">
                {currentlyPresentCount}
              </p>
            </div>
          </div>
        </div>

        {/* CARD 2: Pessoas por empresa */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            {/* Ícone de empresas */}
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            
            {/* Conteúdo do card */}
            <div className="ml-4 min-w-0 flex-1">
              <p className="text-sm font-medium text-blue-600">
                Pessoas por empresa no evento agora
              </p>
              <div className="mt-2">
                {/* 
                  Exibição formatada das empresas
                  text-sm para não ocupar muito espaço
                  break-words para quebrar nomes longos de empresa
                */}
                <p className="text-sm text-blue-900 break-words">
                  {formatCompaniesPresent()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Pessoas não registradas */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center">
            {/* Ícone de pessoas aguardando */}
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            
            {/* Conteúdo do card */}
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-600">
                Pessoas não registradas
              </p>
              <p className="text-2xl font-bold text-orange-900">
                {notCheckedInCount}
              </p>
              <p className="text-xs text-orange-700 mt-1">
                Ainda não fizeram check-in
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Informação adicional sobre total de participantes */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Total de participantes registrados:</span>
          <span className="font-semibold text-gray-900">{people.length}</span>
        </div>
        
        {/* Barra de progresso visual (opcional) */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Progresso de check-ins</span>
            <span>{Math.round(((people.length - notCheckedInCount) / people.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${((people.length - notCheckedInCount) / people.length) * 100}%` 
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exportação padrão do componente para uso em outras partes da aplicação
export default EventSummary;