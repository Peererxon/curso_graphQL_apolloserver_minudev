import { gql, ApolloServer, UserInputError } from "apollo-server";
import { v1 as uuid } from "uuid";
const persons = [
  { name: "John", age: 20, street: "Street 1", city: "City 1", phone: "12345" },
  { name: "Jane", age: 21 },
  { name: "Bob", age: 22 },
  { name: "Mary", age: 23 },
  { name: "Peter", age: 24 },
];

// Todo se debe definir
const typeDefs = gql`
  enum YesNo {
    Yes
    No
  }

  type Person {
    name: String!
    age: Int
    address: Adrees
    id: ID
    phone: String
  }

  type Adrees {
    street: String
    city: String
  }

  type Query {
    personCount: Int!
    """
    agregando el parametro phone como enum custom YesNo
    """
    allPersons(phone: YesNo): [Person]!
    findPerson(name: String!): Person
  }
  """
  Mutaciones son para modificar los datos agregando un nuevo registro o modificar un registro existente
  """
  type Mutation {
    addPerson(name: String!, street: String, city: String, age: Int!): Person
    editPerson(name: String!, phone: String!): Person
  }
`;
/* de manera muy simplista, los resolver son los eventos que van a realizarse o el tipo de query
  son los que van a RESOLVER la consulta que se haga
  tenemos de tipo:
  - Query (son gets)
  - Mutation (son sets o el resto de eventos)
  - Subscription 
  - Scalar 
  - Enum (son los tipos de datos que se pueden usar)
  - InputObject
  - Object
  - Interface
  - Union
  - Fragment
  - Directive
*/
const resolvers = {
  Query: {
    //args es el parametro que se pasa en la consulta
    personCount: () => persons.length,
    allPersons: (root, args) => {
      //Usando el argumento en el resolver
      if (!args.phone) return persons;

      const byPhone = (person) =>
        args.phone === "Yes" ? person.phone : !person.phone;

      return persons.filter(byPhone);
    },
    findPerson: (root, args) => {
      const { name } = args;
      return persons.find((person) => person.name === name);
    },
  },

  Person: {
    // root es el objeto que se esta resolviendo en este caso hace referencia a la persona
    address: (root) => {
      return {
        street: root.street,
        city: root.city,
      };
    }, //esta operacion practicamente extiende el objeto person con un nuevo atributo address,
  },
  Mutation: {
    addPerson: (root, arg) => {
      if (persons.find((person) => person.name === arg.name)) {
        // grahql tiene preparado excepciones que pueden ser lanzadas segun el tipo de error en este caso el nombre de la persona ya existe
        throw new UserInputError("Person already exists", {
          invalidArgs: arg.name,
        });
      }
      const person = { ...arg, id: uuid() };
      persons.push(person); // updated database with the new person
      return person;
    },
    editPerson: (root, args) => {
      const { name, phone } = args;
      const personIndex = persons.findIndex((person) => person.name === name);
      if (personIndex === -1) {
        return null;
      }

      const updatedPerson = { ...persons[personIndex], phone };
      persons[personIndex] = updatedPerson;
      return updatedPerson;
    },
  },
};

/* el servidor necesita que le enviemos la definicion de tipos y los resolvers */
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen().then(({ url }) => {
  console.log(`Server listen at ${url}`);
});
