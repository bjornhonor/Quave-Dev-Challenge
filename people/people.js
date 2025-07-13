// Importação da classe Mongo do pacote meteor/mongo
// Esta importação é necessária para criar uma nova collection do MongoDB
import { Mongo } from 'meteor/mongo';

// Criação da collection People
// O parâmetro 'people' define o nome da collection no MongoDB
export const People = new Mongo.Collection('people');