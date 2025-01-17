import * as Yup from "yup";

// REPLACE ME: HERE YOU CAN DEFINE INTERFACE(S) & VALIDATION SCHEMAS TO REPRESENT YOUR SCAN application_metadata SCHEMA(S)
// interfaces
interface ScanMeta {
	field1: string | null;
	field2: string | null;
	field3: string | null;
}

export interface AppMeta {
	sample_metadata?: ScanMeta;
}

// validation schemas...
const scanMetaSchema: Yup.SchemaOf<ScanMeta> = Yup.object()
	.shape({
		// these can't be required (.defined()) because entire schema object is optional (see interface)
		field1: Yup.string().nullable(),
		field2: Yup.string().nullable(),
		field3: Yup.string().nullable(),
	})
	.defined();

export const appMetaSchema: Yup.SchemaOf<AppMeta> = Yup.object()
	.shape({
		sample_metadata: scanMetaSchema,
	})
	.defined();
