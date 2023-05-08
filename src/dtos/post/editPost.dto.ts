import z from 'zod'

export interface EditPostInputDTO {
    content:string,
    token: string,
    idToEdit: string
}

export type EditPostOutputDTO = undefined //porque não tem corpo, não retorna um valor

//'schema' de validação
export const EditPostSchema = z.object({ 
    content:z.string().min(1), //indica que o valor esperado é string
    token: z.string().min(1),
    idToEdit: z.string().min(1)
}).transform(data => data as EditPostInputDTO)