import {pgTable, text,uuid,integer,boolean, timestamp} from "drizzle-orm/pg-core"
import {relations} from "drizzle-orm"

export const files = pgTable("files", {
    id: uuid("id").defaultRandom().primaryKey(),

    //basic folder informùation
    name: text("name").notNull(),
    path: text("path").notNull(), // /documents/project/resume.pdf
    size: integer("size").notNull(),
    type: text("type").notNull(), //"folder" or "file"

    //storage information
    fileUrl: text("file_url").notNull(), // url to access the file
    thumbnailUrl: text("thumbnail_url").notNull(), // url to access the thumbnail

    //ownership information
    userId: text("user_id").notNull(), // user who uploaded the file
    parentId: uuid("parent_id"), // parent folder id (null for root items)

    //file/folder flags
    isFolder: boolean("is_folder").default(false).notNull(), // true if the item is a folder
    isStarred: boolean("is_starred").default(false).notNull(), // true if the item is starred
    isTrash: boolean("is_trash").default(false).notNull(), // true if the item is in trash

    //Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})

/*
parent : each file/folder can have one parent folder
children : each folder can have many child files/folders
*/
export const filesRelations = relations(files, ({one, many}) => ({
    parent: one(files, {
        fields: [files.parentId],
        references: [files.id],
    }),
    
    //relationship to child file/folder
    children: many(files)
}))

//type definitions
export const File = typeof files.$inferSelect
export const NewFile = typeof files.$inferInsert
    

    