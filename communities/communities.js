// Importação da classe Mongo do pacote meteor/mongo
// Esta importação é necessária para criar uma nova collection do MongoDB
import { Mongo } from 'meteor/mongo';

// Criação da collection Communities
// O parâmetro 'communities' define o nome da collection no MongoDB
export const Communities = new Mongo.Collection('communities');