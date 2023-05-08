import { PostDatabase } from "../database/PostDatabase";
import { CreatePostInputDTO, CreatePostOutputDTO } from "../dtos/post/createPost.dto";
import { DeleteOutputDTO, DeletePostInputDTO } from "../dtos/post/deletePost.dto";
import { EditPostInputDTO, EditPostOutputDTO } from "../dtos/post/editPost.dto";
import { getPostInputDTO, getPostOutputDTO } from "../dtos/post/getPost.dto";
import { LikeOrDislikePostInputDTO, LikeOrDislikePostOutputDTO } from "../dtos/post/likeOrDislikePost.dto";
import { ForbiddenError } from "../error/ForbiddenError";
import { NotFoundError } from "../error/NoFoundError";
import { UnauthorizedError } from "../error/UnauthorizedError";
import { LikeDislikeDB, POST_LIKE, Post } from "../models/Post";
import { USER_ROLES } from "../models/User";
import { IdGenerator } from "../services/IdGenerator";
import { TokenManager } from "../services/TokenManager";

export class PostBusiness {
    constructor(
        private postDatabase: PostDatabase,
        private idGenerator: IdGenerator,
        private tokenManager: TokenManager

        //não terá aqui o hashmanager pois postagem não lida com senha
    ) { }

    public createPost = async (input: CreatePostInputDTO): Promise<CreatePostOutputDTO> => {
        const { content, token } = input

        const payload = this.tokenManager.getPayload(token)
        if (!payload) {
            throw new UnauthorizedError()
        }

        const id = this.idGenerator.generate()

        const post = new Post(
            id,
            content,
            0,
            0,
            new Date().toISOString(),
            new Date().toISOString(),
            payload.id,
            payload.name
        )
        const postDB = post.toDBModel()
        await this.postDatabase.insertPost(postDB)

        const output: CreatePostOutputDTO = undefined
        return output
    }

    public getPosts = async (input: getPostInputDTO): Promise<getPostOutputDTO> => {
        const { token } = input

        const payload = this.tokenManager.getPayload(token) //validação do token
        if (!payload) {
            throw new UnauthorizedError()
        }

        const postsDBWithCreatorName = await this.postDatabase.getPostsWithCreatorName()

        //mapeia cada item do array postsDBWithCreatorName e vai retornar 
        //um novo array com as propriedades do id da tabela do usuario que 
        //fez o post, o post, os likes do post, os dislikes, e todas as outras
        //informações da postagem
        const posts = postsDBWithCreatorName.map((postWithCreatorName) => {
            const post = new Post(
                postWithCreatorName.id,
                postWithCreatorName.content,
                postWithCreatorName.likes,
                postWithCreatorName.dislikes,
                postWithCreatorName.created_at,
                postWithCreatorName.updated_at,
                postWithCreatorName.creator_id,
                postWithCreatorName.creator_name
            )
            return post.toBusinessModel() //retorna o postDB com o formato de Post
        })

        const output: getPostOutputDTO = posts
        return output
    }
    public editPost = async (input: EditPostInputDTO): Promise<EditPostOutputDTO> => {
        const { content, token, idToEdit } = input

        const payload = this.tokenManager.getPayload(token) //validação do token para antes de editar
        if (!payload) {
            throw new UnauthorizedError()
        }

        const postDB = await this.postDatabase.findPostById(idToEdit)

        if (!postDB) {
            throw new NotFoundError("postagem com esta id não existe")
        }

        if (payload.id !== postDB.creator_id) { //verificação para ver se é a mesma pessoa editando sua postagem
            throw new ForbiddenError("Somente quem criou esta postagem poderá editá-la")
        }

        const post = new Post(
            postDB.id,
            postDB.content,
            postDB.likes,
            postDB.dislikes,
            postDB.created_at,
            postDB.updated_at,
            postDB.creator_id,
            payload.name
        )
        post.setContent(content)

        const updatedPostDB = post.toDBModel()
        await this.postDatabase.updatePost(updatedPostDB)

        const output: EditPostOutputDTO = undefined
        return output
    }

    public deletePost = async (input: DeletePostInputDTO): Promise<DeleteOutputDTO> => {
        const { token, idToDelete } = input

        const payload = this.tokenManager.getPayload(token) //validação do token para antes de editar

        if (!payload) {
            throw new UnauthorizedError()
        }

        const postDB = await this.postDatabase.findPostById(idToDelete)

        if (!postDB) {
            throw new NotFoundError("postagem com esta id não existe")
        }

        if (payload.role !== USER_ROLES.ADMIN) { //permissão para o adm poder apagar tb a postagem
            if (payload.id !== postDB.creator_id) { //verificação para ver se é a mesma pessoa editando sua postagem
                throw new ForbiddenError("Somente quem criou esta postagem poderá editá-la")
            }
        }






        await this.postDatabase.deletePostById(idToDelete)

        const output: DeleteOutputDTO = undefined
        return output
    }

    public likeOrDislikePost = async (input: LikeOrDislikePostInputDTO): Promise<LikeOrDislikePostOutputDTO> => {
        const { token, like, postId } = input

        const payload = this.tokenManager.getPayload(token) //validação do token para antes de editar

        if (!payload) {
            throw new UnauthorizedError()
        }

        const postDBWithCreatorName = await this.postDatabase.findPostWithCreatorNameById(postId) //buscar a postagem pelo id

        if (!postDBWithCreatorName) { //se não houver uma postagem com determinado id
            throw new NotFoundError("Postagem com id fornecido não existe")
        }

        const post = new Post(
            postDBWithCreatorName.id,
            postDBWithCreatorName.content,
            postDBWithCreatorName.likes,
            postDBWithCreatorName.dislikes,
            postDBWithCreatorName.created_at,
            postDBWithCreatorName.updated_at,
            postDBWithCreatorName.creator_id,
            postDBWithCreatorName.creator_name
        )
        //transforma boolean em number
        const likeSQlite = like ? 1 : 0 //logica para retornar booleano
        //se der like é truthy, dislike é falsy

        const likeDislikeDB: LikeDislikeDB = {
            user_id: payload.id,
            post_id: postId,
            like: likeSQlite
        }
        //busca no banco de dados se já existe um like na postagem
        const likeDislikeExists = await this.postDatabase.findLikeDislike(likeDislikeDB)

        // console.log(likeDislikeExists)

        if (likeDislikeExists === POST_LIKE.ALREADY_LIKED) { //se deu like
            if (like) {
                await this.postDatabase.removeLikeDislike(likeDislikeDB)
                post.removeLike()
            } else {
            await this.postDatabase.updateLikeDislike(likeDislikeDB)
            post.removeLike()
            post.addDislike()
            }

        } else if(likeDislikeExists === POST_LIKE.ALREADY_DISLIKED){
            if(like === false){
                await this.postDatabase.removeLikeDislike(likeDislikeDB)
                post.removeDislike()
            } else {
                await this.postDatabase.updateLikeDislike(likeDislikeDB)
                post.removeDislike()
                post.addLike()
            }

        } else {
            await this.postDatabase.insertLikeDislike(likeDislikeDB)
            like ? post.addLike() : post.addDislike()
        }

        //atualizando os dados
        const updatedPostDB = post.toDBModel()
        await this.postDatabase.updatePost(updatedPostDB) 

        const output:LikeOrDislikePostOutputDTO = undefined
        return output


        //update da tabela posts
    }
}








