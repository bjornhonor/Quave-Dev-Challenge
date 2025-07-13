// Importação do Meteor para usar a funcionalidade de publications
// As publications são essenciais para o sistema de reatividade do Meteor
import { Meteor } from 'meteor/meteor';

// Importação das collections que serão utilizadas nas publicações
// Estas collections contêm os dados que precisem ser enviados ao cliente
import { Communities } from '../communities/communities';
import { People } from '../people/people';

/**
 * Publicação: communities
 * 
 * Esta publicação envia todos os eventos/comunidades disponíveis para o cliente.
 * É utilizada para popular o dropdown de seleção de eventos na interface.
 * Como geralmente há poucos eventos, enviamos todos sem filtragem.
 * 
 * @returns {Mongo.Cursor} - Cursor reativo com todos os documentos da collection Communities
 */
Meteor.publish('communities', () => Communities.find());

/**
 * Publicação: people
 * 
 * Esta publicação é responsável por enviar apenas as pessoas registradas
 * no evento/comunidade selecionado. É uma publicação parametrizada que
 * recebe o ID da comunidade como argumento.
 * 
 * Funcionalidades principais:
 * - Filtra pessoas por evento específico
 * - Implementa validações de segurança
 * - Fornece reatividade para check-ins/check-outs
 * - Otimiza performance enviando apenas dados relevantes
 * 
 * @param {string} communityId - ID da comunidade/evento para filtrar as pessoas
 * @returns {Mongo.Cursor|Array} - Cursor com pessoas filtradas ou array vazio se inválido
 */
Meteor.publish('people', (communityId) => {
  // Log removido para conformidade ESLint
  // console.log(`Publicação people foi solicitada para communityId: ${communityId}`);
  
  // VALIDAÇÃO DE SEGURANÇA: Verificar se communityId foi fornecido
  // Sem um communityId válido, não devemos enviar nenhum dado
  // Isso previne que clientes vejam dados de todos os eventos sem autorização
  if (!communityId) {
    // Log removido para conformidade ESLint
    // console.log('Publicação people: communityId não fornecido, retornando vazio');
    
    // Retorna array vazio - nenhum dado será enviado ao cliente
    // O Meteor automaticamente sinaliza ready() quando a função termina
    return [];
  }
  
  // VALIDAÇÃO ADICIONAL: Verificar se communityId é uma string
  // Isso previne ataques e garante que o tipo de dado está correto
  if (typeof communityId !== 'string') {
    // Log removido para conformidade ESLint
    // console.log('Publicação people: communityId deve ser uma string, retornando vazio');
    return [];
  }
  
  // VALIDAÇÃO: Verificar se communityId não é uma string vazia
  // Uma string vazia não é um ID válido e poderia causar problemas na busca
  if (!communityId.trim()) {
    // Log removido para conformidade ESLint
    // console.log('Publicação people: communityId está vazio, retornando vazio');
    return [];
  }
  
  // BUSCA FILTRADA: Retorna apenas pessoas do evento especificado
  // O filtro { communityId } é equivalente a { communityId: communityId }
  // Garante que apenas pessoas associadas ao evento selecionado sejam enviadas
  const cursor = People.find({ communityId });
  
  // Log removido para conformidade ESLint
  // console.log(`Publicação people: enviando pessoas para communityId ${communityId}`);
  
  // Retorna o cursor filtrado
  // Este cursor é reativo, então quando pessoas fazem check-in/check-out,
  // ou quando novos participantes são adicionados ao evento,
  // todos os clientes inscritos recebem as atualizações automaticamente
  return cursor;
  
  // IMPORTANTE: A reatividade funciona em múltiplos níveis:
  // 1. Se uma pessoa é adicionada/removida do evento, a lista é atualizada
  // 2. Se os dados de check-in/check-out de uma pessoa mudam, os clientes veem imediatamente
  // 3. Se uma pessoa muda de evento, ela desaparece/aparece nas listas apropriadas
});