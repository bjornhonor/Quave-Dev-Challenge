// Importação do Meteor para usar a funcionalidade de publications
// As publications são essenciais para o sistema de reatividade do Meteor
import { Meteor } from 'meteor/meteor';

// Importação das collections que serão utilizadas nas publicações
// Estas collections contêm os dados que precisam ser enviados ao cliente
import { Communities } from '../api/collections/communities.js';
import { People } from '../api/collections/people.js';

Meteor.publish('communities', function() {
  // Log para debug - ajuda a monitorar quando a publicação é chamada
  console.log('Publicação communities foi solicitada por um cliente');
  
  // Retorna um cursor para todos os documentos da collection Communities
  // O cursor é reativo - quando novos eventos são adicionados ou modificados,
  // todos os clientes inscritos nesta publicação recebem as atualizações automaticamente
  return Communities.find();
});

/**
 * Esta publicação é utilizada para:
 * - Mostrar apenas as pessoas registradas no evento selecionado
 * - Implementar reatividade na lista de participantes
 * - Permitir updates em tempo real dos status de check-in/check-out
 * - Otimizar performance enviando apenas dados relevantes
 */
Meteor.publish('people', function(communityId) {
  // Log para debug - inclui o communityId para facilitar troubleshooting
  console.log(`Publicação people foi solicitada para communityId: ${communityId}`);
  
  // VALIDAÇÃO DE SEGURANÇA: Verificar se communityId foi fornecido
  // Sem um communityId válido, não devemos enviar nenhum dado
  // Isso previne que clientes vejam dados de todos os eventos sem autorização
  if (!communityId) {
    console.log('Publicação people: communityId não fornecido, retornando vazio');
    
    // Retorna um cursor vazio - nenhum dado será enviado ao cliente
    // this.ready() sinaliza que a publicação terminou de enviar dados
    this.ready();
    return;
  }
  
  // VALIDAÇÃO ADICIONAL: Verificar se communityId é uma string
  // Isso previne ataques e garante que o tipo de dado está correto
  if (typeof communityId !== 'string') {
    console.log('Publicação people: communityId deve ser uma string, retornando vazio');
    this.ready();
    return;
  }
  
  // VALIDAÇÃO: Verificar se communityId não é uma string vazia
  if (!communityId.trim()) {
    console.log('Publicação people: communityId está vazio, retornando vazio');
    this.ready();
    return;
  }
  
  // BUSCA FILTRADA: Retorna apenas pessoas do evento especificado
  // O filtro { communityId: communityId } garante que apenas pessoas
  // associadas ao evento selecionado sejam enviadas ao cliente
  const cursor = People.find({ communityId: communityId });
  
  // Log para debug - ajuda a monitorar quantas pessoas estão sendo enviadas
  console.log(`Publicação people: enviando pessoas para communityId ${communityId}`);
  
  // Retorna o cursor filtrado
  // Este cursor é reativo, então quando pessoas fazem check-in/check-out,
  // ou quando novos participantes são adicionados ao evento,
  // todos os clientes inscritos recebem as atualizações automaticamente
  return cursor;
  
  // IMPORTANTE: A reatividade funciona em dois níveis aqui:
  // 1. Se uma pessoa é adicionada/removida do evento, a lista é atualizada
  // 2. Se os dados de check-in/check-out de uma pessoa mudam, os clientes veem imediatamente
});