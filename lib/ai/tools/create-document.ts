import { tool, type UIMessageStreamWriter } from "ai";
import type { Session } from "next-auth";
import { z } from "zod";
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from "@/lib/artifacts/server";
import type { ChatMessage } from "@/lib/types";
import { generateUUID } from "@/lib/utils";

type CreateDocumentProps = {
  session: Session;
  dataStream: UIMessageStreamWriter<ChatMessage>;
};

export const createDocument = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      "Create an interactive artifact/document that appears in a side panel. USE THIS FREQUENTLY for any substantial content! Perfect for: code (HTML, JS, Python, React, CSS, etc.), articles, essays, documentation, spreadsheets, tables. The artifact system will automatically generate the content based on the title you provide. Users can then edit and interact with it. Choose kind='code' for any programming code, kind='text' for written content, kind='sheet' for data/tables.",
    inputSchema: z.object({
      title: z.string().describe("A clear, descriptive title that explains what to create (e.g., 'Interactive Todo App', 'Essay on Climate Change', 'Sales Data Table'). The artifact system will generate content based on this title."),
      kind: z.enum(artifactKinds).describe("The artifact type: 'code' for ANY programming language (HTML, JavaScript, Python, React, CSS, etc.), 'text' for articles/essays/documents, 'sheet' for spreadsheets/CSV/tables"),
    }),
    execute: async ({ title, kind }) => {
      const id = generateUUID();

      dataStream.write({
        type: "data-kind",
        data: kind,
        transient: true,
      });

      dataStream.write({
        type: "data-id",
        data: id,
        transient: true,
      });

      dataStream.write({
        type: "data-title",
        data: title,
        transient: true,
      });

      dataStream.write({
        type: "data-clear",
        data: null,
        transient: true,
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }

      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        session,
      });

      dataStream.write({ type: "data-finish", data: null, transient: true });

      return {
        id,
        title,
        kind,
        content: "A document was created and is now visible to the user.",
      };
    },
  });
