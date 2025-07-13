// Importação do Meteor para usar a funcionalidade de methods
// O Meteor.methods permite criar funções que podem ser chamadas do cliente de forma segura
import { Meteor } from 'meteor/meteor';

// Importação da collection People para manipular os dados dos participantes
// Esta collection contém todos os participantes registrados nos eventos
import { People } from '../api/collections/people.js';

/**
 * Métodos do Meteor para gerenciar check-in e check-out de participantes
 * 
 * Os methods do Meteor fornecem uma camada segura entre o cliente e o servidor,
 * permitindo que o frontend chame funções no servidor de forma controlada.
 * Todos os métodos aqui são assíncronos (compatível com Meteor 3) e realizam
 * validações antes de manipular os dados no banco de dados MongoDB.
 */

// Definição dos métodos usando Meteor.methods
// Cada método definido aqui pode ser chamado do cliente usando Meteor.callAsync()
Meteor.methods({
  
  /**
   * Método: people.checkIn
   * 
   * Responsável por realizar o check-in de um participante em um evento.
   * Quando executado, registra a data/hora atual como momento do check-in
   * e garante que não existe um check-out pendente (define como null).
   * 
   * @param {string} personId - ID único da pessoa que está fazendo check-in
   * @throws {Meteor.Error} - Se personId não for uma string válida ou se a pessoa não for encontrada
   */
  async 'people.checkIn'(personId) {
    // Validação de entrada: verifica se personId é uma string
    // Esta validação é importante para segurança e prevenção de erros
    if (typeof personId !== 'string') {
      throw new Meteor.Error('invalid-argument', 'O ID da pessoa deve ser uma string válida.');
    }

    // Validação adicional: verifica se a string não está vazia
    // Uma string vazia não é um ID válido do MongoDB
    if (!personId.trim()) {
      throw new Meteor.Error('invalid-argument', 'O ID da pessoa não pode estar vazio.');
    }

    try {
      // Atualização do documento na collection People usando o método updateAsync (Meteor 3)
      // O método updateAsync é assíncrono e retorna uma Promise
      const result = await People.updateAsync(
        // Seletor: encontra o documento com o _id correspondente ao personId
        { _id: personId },
        
        // Operador $set: define/atualiza os campos especificados
        {
          $set: {
            // checkInDate: registra a data e hora exatas do check-in
            checkInDate: new Date(),
            
            // checkOutDate: define como null para limpar qualquer check-out anterior
            // Isso garante que a pessoa apareça como "presente" no evento
            checkOutDate: null
          }
        }
      );

      // Verifica se a atualização foi bem-sucedida
      // result.modifiedCount indica quantos documentos foram modificados
      if (result.modifiedCount === 0) {
        throw new Meteor.Error('person-not-found', 'Pessoa não encontrada ou já com check-in realizado.');
      }

      // Retorna sucesso se a operação foi concluída
      return { success: true, message: 'Check-in realizado com sucesso!' };
      
    } catch (error) {
      // Captura e relança erros específicos do Meteor
      if (error instanceof Meteor.Error) {
        throw error;
      }
      
      // Para outros tipos de erro, cria um erro genérico do Meteor
      throw new Meteor.Error('database-error', 'Erro ao realizar check-in: ' + error.message);
    }
  },

  /**
   * Método: people.checkOut  
   * 
   * Responsável por realizar o check-out de um participante que já fez check-in.
   * Registra a data/hora atual como momento da saída do evento.
   * O participante deve ter feito check-in previamente para poder fazer check-out.
   * 
   * @param {string} personId - ID único da pessoa que está fazendo check-out
   * @throws {Meteor.Error} - Se personId não for uma string válida ou se a pessoa não for encontrada
   */
  async 'people.checkOut'(personId) {
    // Validação de entrada: verifica se personId é uma string
    // Mesma validação do método checkIn para consistência
    if (typeof personId !== 'string') {
      throw new Meteor.Error('invalid-argument', 'O ID da pessoa deve ser uma string válida.');
    }

    // Validação adicional: verifica se a string não está vazia
    if (!personId.trim()) {
      throw new Meteor.Error('invalid-argument', 'O ID da pessoa não pode estar vazio.');
    }

    try {
      // Busca primeiro a pessoa para verificar se ela fez check-in
      // Isso garante que só pessoas que fizeram check-in possam fazer check-out
      const person = await People.findOneAsync({ _id: personId });
      
      if (!person) {
        throw new Meteor.Error('person-not-found', 'Pessoa não encontrada.');
      }

      // Verifica se a pessoa fez check-in antes de permitir check-out
      // Uma pessoa só pode sair se tiver entrado primeiro
      if (!person.checkInDate) {
        throw new Meteor.Error('invalid-operation', 'Não é possível fazer check-out sem ter feito check-in primeiro.');
      }

      // Verifica se a pessoa já fez check-out
      // Previne múltiplos check-outs para a mesma entrada
      if (person.checkOutDate) {
        throw new Meteor.Error('already-checked-out', 'Esta pessoa já fez check-out.');
      }

      // Atualização do documento para registrar o check-out
      const result = await People.updateAsync(
        // Seletor: encontra o documento com o _id correspondente
        { _id: personId },
        
        // Operador $set: atualiza apenas o campo checkOutDate
        {
          $set: {
            // checkOutDate: registra a data e hora exatas do check-out
            checkOutDate: new Date()
          }
        }
      );

      // Verifica se a atualização foi bem-sucedida
      if (result.modifiedCount === 0) {
        throw new Meteor.Error('update-failed', 'Falha ao atualizar os dados da pessoa.');
      }

      // Retorna sucesso se a operação foi concluída
      return { success: true, message: 'Check-out realizado com sucesso!' };
      
    } catch (error) {
      // Captura e relança erros específicos do Meteor
      if (error instanceof Meteor.Error) {
        throw error;
      }
      
      // Para outros tipos de erro, cria um erro genérico do Meteor
      throw new Meteor.Error('database-error', 'Erro ao realizar check-out: ' + error.message);
    }
  }
});