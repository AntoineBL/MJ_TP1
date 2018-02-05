import { IEntity, Entity } from './entity';
import { IComponent } from './components';

// # Interface *ISceneWalker*
// Définit le prototype de fonction permettant d'implémenter
// le patron de conception [](https://fr.wikipedia.org/wiki/_(patron_de_conception))
// sur les différentes entités de la scène.
export interface ISceneWalker {
  (entity: IEntity, name: string): Promise<any>;
}

// # Interfaces de description
// Ces interfaces permettent de définir la structure de
// description d'une scène, telle que normalement chargée
// depuis un fichier JSON.
export interface IComponentDesc {
  [key: string]: any;
}

export interface IEntityDesc {
  components: IComponentDesc;
  children: ISceneDesc;
}

export interface ISceneDesc {
  [key: string]: IEntityDesc;
}

// # Classe *Scene*
// La classe *Scene* représente la hiérarchie d'objets contenus
// simultanément dans la logique du jeu.
export class Scene {
  static current: Scene;

  // ## Attribut *description*
  // Contient la description de la hiérarchie et ses paramètres
  description: ISceneDesc;

  mapEntity = new Map<string, IEntity>();

  
  // ## Fonction statique *create*
  // La fonction *create* permet de créer une nouvelle instance
  // de la classe *Scene*, contenant tous les objets instanciés
  // et configurés. Le paramètre `description` comprend la
  // description de la hiérarchie et ses paramètres. La fonction
  // retourne une promesse résolue lorsque l'ensemble de la
  // hiérarchie est configurée correctement.
  static create(description: ISceneDesc): Promise<Scene> {
    const scene = new Scene(description);
    Scene.current = scene;

    return new Promise(function (resolve, reject){
      if(Scene.current.description == description) resolve(Scene.current);
      else reject("Can't create this scene");
    });
    //throw new Error('Not implemented');
  }

  private constructor(description: ISceneDesc) {
    this.description = description;
 
    for(var element in description) {

      this.traiteEntity(element, description[element]);

    }
  }

  traiteEntity(entityName : string, entityDesc : IEntityDesc) {
    var entity = new Entity();
    this.mapEntity.set(entityName, entity)
    console.log("Creation de l'entité " + entityName)

    if(Object.keys(entityDesc.components).length === 0) {
      console.log(entityName + " ... ne possede pas de composants !")
    } else {
      for(var subComponent in entityDesc.components) {
        entity.addComponent(subComponent)
        console.log(entityName + " possede le composant : " + subComponent)
      }
    }
    if(Object.keys(entityDesc.children).length === 0) {
      console.log(entityName + " ... ne possede pas de chidren !")
    } else {   
      for(var subEntity in entityDesc.children) {
        this.traiteEntityChild(subEntity, entityDesc.children[subEntity], entity, entityName)
      }
    }
  }

  traiteEntityChild(entityName : string, entityDesc : IEntityDesc, entityParent : IEntity, entityParentName : string) {
    var entity = new Entity();
    entityParent.addChild(entityName, entity)
    this.mapEntity.set(entityName, entity)
    console.log("Creation de l'entité " + entityName + " qui a pour parent : " + entityParentName)

    if(Object.keys(entityDesc.components).length === 0) {
      console.log(entityName + " ... ne possede pas de composants !")
    } else {
      for(var subComponent in entityDesc.components) {
        entity.addComponent(subComponent)
        console.log(entityName + " possede le composant : " + subComponent)
      }
    }
    if(Object.keys(entityDesc.children).length === 0) {
      console.log(entityName + " ...  ne possede pas de chidren !")
    } else {   
      for(var subEntity in entityDesc.children) {
        this.traiteEntityChild(subEntity, entityDesc.children[subEntity], entity, entityName)
      }
    }
  }

  // ## Fonction *findObject*
  // La fonction *findObject* retourne l'objet de la scène
  // portant le nom spécifié.
  findObject(objectName: string): IEntity {

    if(typeof this.mapEntity.get(objectName) ===  undefined) {
          throw new Error("L'entité n'existe pas dans la scene");
    } else {
      console.log("OKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKKK")
      console.log(this.mapEntity.get("complex "))
      return <IEntity>this.mapEntity.get(objectName)
    }
  }

  // ## Méthode *walk*
  // Cette méthode parcourt l'ensemble des entités de la
  // scène et appelle la fonction `fn` pour chacun, afin
  // d'implémenter le patron de conception [](https://fr.wikipedia.org/wiki/_(patron_de_conception)).
  walk(fn: ISceneWalker): Promise<any> {

    this.mapEntity.forEach(function (item, key){
      fn(item, key)
    })

    return new Promise(function (resolve, reject){
      resolve();
    });
    
  }
}
