import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { DateTime } from "luxon";
import { Formik, Form, Field, FormikHelpers } from "formik";
import { Select, TextField } from "formik-mui";
import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Alert,
	AlertTitle,
	Badge,
	Box,
	Button,
	Card,
	CardContent,
	Checkbox,
	Chip,
	// horizontally center page content
	Container,
	DialogActions,
	DialogContent,
	Divider,
	Fab,
	FormControl,
	FormControlLabel,
	FormGroup,
	FormLabel,
	Grid,
	IconButton,
	InputAdornment,
	InputLabel,
	LinearProgress,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	MenuItem,
	Paper,
	Select as MuiSelect,
	Tabs,
	Tab,
	TextField as MuiTextField,
	Toolbar,
	Tooltip,
	Typography,
	Theme,
	SelectChangeEvent,
	Zoom,
} from "@mui/material";
import { keyframes } from "tss-react";
import { makeStyles, withStyles } from "tss-react/mui";
import { useTheme } from "@mui/material/styles";
import {
	AccountTree as AccountTreeIcon,
	AddCircleOutline as AddCircleOutlineIcon,
	ArrowBackIos as ArrowBackIosIcon,
	Assessment as AssessmentIcon,
	AssignmentLate as AssignmentLateIcon,
	AssignmentTurnedIn as AssignmentTurnedInIcon,
	Autorenew as AutorenewIcon,
	BugReport as BugReportIcon,
	Category as CategoryIcon,
	Clear as ClearIcon,
	Cloud as CloudIcon,
	Code as CodeIcon,
	Delete as DeleteIcon,
	Edit as EditIcon,
	ErrorOutlineOutlined as ErrorOutlinedIcon,
	ExpandMore as ExpandMoreIcon,
	Extension as ExtensionIcon,
	FilterList as FilterListIcon,
	Folder as FolderIcon,
	Help as HelpIcon,
	History as HistoryIcon,
	Info as InfoIcon,
	Layers as LayersIcon,
	OpenInNew as OpenInNewIcon,
	Person as PersonIcon,
	Queue as QueueIcon,
	ReportProblemOutlined as ReportProblemOutlinedIcon,
	Security as SecurityIcon,
	Tune as TuneIcon,
	Visibility as VisibilityIcon,
	VisibilityOff as VisibilityOffIcon,
	VpnKey as VpnKeyIcon,
	WatchLater as WatchLaterIcon,
} from "@mui/icons-material";
import {
	Cell,
	Label,
	Legend,
	PieChart,
	Pie,
	ResponsiveContainer,
} from "recharts";
import { useLingui } from "@lingui/react";
import { Trans, t, plural } from "@lingui/macro";
import * as Yup from "yup";
import * as QueryString from "query-string";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
// https://github.com/react-syntax-highlighter/react-syntax-highlighter/issues/221#issuecomment-566502780
import json from "react-syntax-highlighter/dist/cjs/languages/prism/json";
import {
	a11yDark,
	atomDark,
	coy,
	dracula,
	materialDark,
	materialLight,
	materialOceanic,
	nord,
	okaidia,
	prism,
	solarizedlight,
	vs,
} from "react-syntax-highlighter/dist/cjs/styles/prism";

import { FilterDef, HiddenFindingsRequest } from "api/client";
import { AppDispatch } from "app/store";
import {
	colorCritical,
	colorHigh,
	colorMedium,
	colorLow,
	colorNegligible,
} from "app/colors";
import {
	capitalize,
	formatDate,
	compareButIgnoreLeadingDashes,
	vcsHotLink,
} from "utils/formatters";
import { RootState } from "app/rootReducer";
import DraggableDialog from "components/DraggableDialog";
import { ExpiringDateTimeCell } from "components/DateTimeCell";
import DatePickerField from "components/FormikPickers";
import {
	addHiddenFinding,
	clearHiddenFindings,
	deleteHiddenFinding,
	getHiddenFindings,
	resetStatus,
	selectAllHiddenFindings,
	selectTotalHiddenFindings,
	updateHiddenFinding,
} from "features/hiddenFindings/hiddenFindingsSlice";
import { addNotification } from "features/notifications/notificationsSlice";
import {
	getScanById,
	clearScans,
	selectScanById,
} from "features/scans/scansSlice";
import { selectCurrentUser } from "features/users/currentUserSlice";
import {
	HiddenFinding,
	HiddenFindingType,
} from "features/hiddenFindings/hiddenFindingsSchemas";
import {
	AnalysisFinding,
	AnalysisReport,
	ScanCategories,
	ScanErrors,
	ScanFormLocationState,
	SecretFinding,
	SecretFindingResult,
	SeverityLevels,
} from "features/scans/scansSchemas";
import EnhancedTable, {
	ColDef,
	OrderMap,
	RowDef,
} from "components/EnhancedTable";
import CustomCopyToClipboard from "components/CustomCopyToClipboard";
import ListItemMetaMultiField from "custom/ListItemMetaMultiField";
import ResultsMetaField from "custom/ResultsMetaField";
import MailToLink from "components/MailToLink";
import { User } from "features/users/usersSchemas";
import TooltipCell from "components/TooltipCell";
import { Key, Path } from "history";
import { SeverityChip } from "components/ChipCell";
import { pluginKeys } from "app/scanPlugins";

// generates random Material-UI palette colors we use for graphs
// after imports to make TypeScript happy
const randomMC = require("random-material-color");

SyntaxHighlighter.registerLanguage("json", json);

const StyledBadge = withStyles(Badge, (theme: Theme) => ({
	badge: {
		right: -3,
		top: 13,
		border: `0.125rem solid ${theme.palette.background.paper}`,
		padding: "0 0.25rem",
	},
}));

const RedButton = withStyles(Button, (theme: Theme) => ({
	root: {
		color: theme.palette.getContrastText(theme.palette.error.main),
		backgroundColor: theme.palette.error.main,
		"&:hover": {
			backgroundColor: theme.palette.error.dark,
		},
	},
}));

const useStyles = makeStyles()((theme) => ({
	accordionDetails: {
		display: "block",
	},
	accordionSummary: {
		height: 0,
		minHeight: "2.5rem",
		"&.Mui-expanded": {
			minHeight: "2.5rem",
		},
	},
	alert: {
		width: theme.spacing(64),
	},
	alertIconError: {
		fill: theme.palette.error.main,
	},
	alertIconWarning: {
		fill: theme.palette.warning.main,
	},
	alertPopup: {
		position: "absolute", // floating over content
		zIndex: 100,
		width: "100%",
		"& > .MuiAlert-action": {
			alignItems: "flex-start",
		},
	},
	// TODO: The following alertText classes don't use [error|warning].light, revisit for MUIv5
	alertTextError: {
		color:
			theme.palette.mode === "dark" ? "rgb(250, 179, 174)" : "rgb(97, 26, 21)",
	},
	alertTextWarning: {
		color:
			theme.palette.mode === "dark" ? "rgb(255, 213, 153)" : "rgb(102, 60, 0)",
	},
	alertContainer: {
		display: "flex",
		justifyContent: "center",
	},
	chipPlugins: {
		marginRight: theme.spacing(0.5),
		marginBottom: theme.spacing(0.5),
	},
	dialogButtons: {
		"& > *": {
			marginLeft: theme.spacing(1),
		},
	},
	divider: {
		marginTop: theme.spacing(3),
		marginBottom: theme.spacing(3),
	},
	fieldError: {
		color: theme.palette.error.main,
	},
	filterField: {
		height: "2.75em",
	},
	findingDetails: {
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
	findingDetailsBox: {
		marginTop: theme.spacing(2),
	},
	findingDetailsLabel: {
		fontWeight: "bold",
		marginRight: theme.spacing(1),
		minWidth: "20rem",
	},
	findingDetailsValueAny: {
		fontStyle: "italic",
	},
	findingFormField: {
		marginTop: theme.spacing(1),
	},
	findingFormStringField: {
		marginLeft: theme.spacing(1),
		width: "55%",
	},
	findingFormSelectField: {
		marginTop: theme.spacing(2),
	},
	findingHelpList: {
		margin: 0,
	},
	formControl: {
		marginRight: theme.spacing(2),
	},
	heading: {
		fontSize: theme.typography.pxToRem(15),
		fontWeight: theme.typography.fontWeightRegular as any,
	},
	helpIcon: {
		marginRight: theme.spacing(1),
	},
	// truncate long items in summary section + add ellipsis
	listItemText: {
		whiteSpace: "nowrap",
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
	listItemTextWrapped: {
		whiteSpace: "pre-wrap",
		overflow: "hidden",
		textOverflow: "ellipsis",
	},
	metaDataList: {
		paddingLeft: "1em",
	},
	navButtons: {
		marginBottom: theme.spacing(1),
		"& > *": {
			marginLeft: theme.spacing(2),
		},
	},
	overviewCard: {
		marginTop: theme.spacing(1),
		height: "22rem",
	},
	ocContainer: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "15rem",
	},
	ocExtraTextArea: {
		textOverflow: "ellipsis",
		overflow: "hidden",
		whiteSpace: "nowrap",
		marginLeft: "0.3rem",
		marginRight: "0.3rem",
	},
	ocTitle: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	ocTitleIcon: {
		paddingRight: theme.spacing(0.5),
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
	oneHundredPercent: { width: "100%", height: "100%" },
	paper: {
		marginBottom: theme.spacing(3),
		padding: theme.spacing(2),
	},
	paperHeader: {
		marginBottom: theme.spacing(2),
	},
	pieInnerLabel: {
		fill: theme.palette.text.primary,
	},
	rawToolbar: {
		display: "flex",
		alignItems: "center",
		padding: theme.spacing(2),
		paddingLeft: theme.spacing(3),
		paddingBottom: theme.spacing(1),
	},
	refreshSpin: {
		animation: `${keyframes`
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
		`} 1.4s linear infinite`,
	},
	resultsError: {
		color: theme.palette.error.main,
		borderColor: theme.palette.error.main,
		fill: theme.palette.error.main,
	},
	resultsSuccess: {
		color: theme.palette.success.main,
		borderColor: theme.palette.success.main,
		fill: theme.palette.success.main,
	},
	scanErrorAlert: {
		marginBottom: "1px",
		marginLeft: theme.spacing(1),
		marginRight: theme.spacing(1),
		padding: "0 12px",
	},
	scanErrorsContainer: {
		height: "auto",
		maxHeight: "8.5rem",
		overflowY: "auto",
	},
	scanMessagesAccordionDetails: {
		padding: 0,
	},
	selectFilter: {
		minWidth: "12rem",
	},
	showFilters: {
		[theme.breakpoints.down("md")]: {
			display: "none",
		},
		[theme.breakpoints.up("lg")]: {
			display: "block",
		},
	},
	// ensure source file list doesn't expand dialog width
	sourceFileList: {
		whiteSpace: "normal",
		wordWrap: "break-word",
	},
	sourceFileListScrollable: {
		height: "auto",
		maxHeight: "4rem",
		overflowY: "auto",
	},
	summaryIcon: {
		verticalAlign: "middle",
	},
	tab: {
		// tab hovered - add primary color to icon and label
		// without this it's not as obvious which tabs are navigable vs disabled
		"&.MuiTab-labelIcon:hover": {
			color: theme.palette.primary.main, // use primary color instead of (default) secondary
		},
		// make disabled icon and label just a bit more opaque so it's clearer it's disabled
		"&.MuiTab-labelIcon:disabled": {
			opacity: "0.5",
		},
	},
	tabDialogGrid: {
		overflowWrap: "break-word",
	},
	tableDescription: {
		padding: theme.spacing(2),
		paddingBottom: theme.spacing(3),
	},
	tableInfo: {
		padding: theme.spacing(2),
		[theme.breakpoints.down("md")]: {
			paddingBottom: theme.spacing(3),
		},
		[theme.breakpoints.up("lg")]: {
			paddingBottom: 0,
		},
	},
	techChartContainer: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "350px",
	},
	vulnLinkButton: {
		textTransform: "none", // don't uppercase text in button
	},
	warningIcon: {
		fill: theme.palette.warning.main,
		marginLeft: theme.spacing(1),
		verticalAlign: "middle",
	},
}));

const FindingAccordion = withStyles(Accordion, (theme, _props, classes) => ({
	root: {
		border: "1px solid",
		borderColor: theme.palette.divider,
		borderRadius: "10px",
		[`&.${classes.expanded}`]: {
			// remove 16px margin added at bottom of accordion when expanded
			margin: 0,
		},
	},
	// blank element required here for "&$expanded" in root to take effect
	expanded: {},
}));

const FindingAccordionSummary = withStyles(
	AccordionSummary,
	(_theme, _props, classes) => ({
		root: {
			margin: 0,
			[`&.${classes.expanded}`]: {
				minHeight: "32px",
			},
		},
		content: {
			// ensure icon and text align vertically
			verticalAlign: "middle",
			alignItems: "center",
			[`&.${classes.expanded}`]: {
				// same margin as content (non-expanded)
				margin: "12px 0 0 0",
			},
		},
		expanded: {},
	})
);

const NoResults = (props: { title: string }) => {
	const { title } = props;

	return (
		<Paper elevation={2}>
			<Typography
				align="center"
				style={{ fontStyle: "italic", padding: "2em" }}
			>
				{title}
			</Typography>
		</Paper>
	);
};

interface TabPanelProps {
	children?: React.ReactNode;
	index: any;
	value: any;
}

function TabPanel(props: TabPanelProps) {
	const { children, value, index, ...other } = props;

	return (
		<div
			role="tabpanel"
			hidden={value !== index}
			id={`tabpanel-${index}`}
			aria-labelledby={`tab-${index}`}
			{...other}
		>
			{value === index && <Box>{children}</Box>}
		</div>
	);
}

// a11y props added to each tab component
function a11yProps(index: any) {
	return {
		id: `tab-${index}`,
		"aria-controls": `tabpanel-${index}`,
	};
}

// how severity types should be ordered (0 = greatest)
const severityOrderMap: OrderMap & SeverityLevels = {
	critical: 0,
	high: 1,
	medium: 2,
	low: 3,
	negligible: 4,
	"": 5,
};

export const FindingTypeChip = (props: {
	value?: HiddenFindingType;
	count?: number;
}) => {
	const { i18n } = useLingui();
	const { value, count } = props;

	let chip = <></>;
	switch (value) {
		case "secret":
			chip = (
				<Chip
					icon={<VpnKeyIcon />}
					label={
						count !== undefined
							? i18n._(t`Secret: ${count}`)
							: i18n._(t`Secret`)
					}
					size="small"
					variant="outlined"
				/>
			);
			break;
		case "secret_raw":
			chip = (
				<Chip
					icon={<VpnKeyIcon />}
					label={
						count !== undefined
							? i18n._(t`Secret Raw: ${count}`)
							: i18n._(t`Secret Raw`)
					}
					size="small"
					variant="outlined"
				/>
			);
			break;
		case "static_analysis":
			chip = (
				<Chip
					icon={<BugReportIcon />}
					label={
						count !== undefined
							? i18n._(t`Static Analysis: ${count}`)
							: i18n._(t`Static Analysis`)
					}
					size="small"
					variant="outlined"
				/>
			);
			break;
		case "vulnerability":
			chip = (
				<Chip
					icon={<SecurityIcon />}
					label={
						count !== undefined
							? i18n._(t`Vulnerability: ${count}`)
							: i18n._(t`Vulnerability`)
					}
					size="small"
					variant="outlined"
				/>
			);
			break;
		case "vulnerability_raw":
			chip = (
				<Chip
					icon={<SecurityIcon />}
					label={
						count !== undefined
							? i18n._(t`Vulnerability Raw: ${count}`)
							: i18n._(t`Vulnerability Raw`)
					}
					size="small"
					variant="outlined"
				/>
			);
			break;
	}
	return chip;
};

// uses multiple fields in table row
export const SourceCell = (props: { row?: RowDef | null }) => {
	const { classes } = useStyles();
	const { row } = props;
	const fileRegex = /:* .*$/; // trim filename after (optional) : and whitespace

	const unhiddenFindingWarning = () => {
		// hidden findings don't cover all source files
		if (
			row?.unhiddenFindings &&
			Array.isArray(row?.unhiddenFindings) &&
			row?.unhiddenFindings.length > 0
		) {
			const title = plural(row?.unhiddenFindings.length, {
				one: "# Source file not covered by this hidden finding",
				other: "# Source files not covered by this hidden finding",
			});
			return (
				<Tooltip title={title}>
					<ReportProblemOutlinedIcon
						className={classes.warningIcon}
						aria-label={title}
					/>
				</Tooltip>
			);
		}
		return <></>;
	};

	let files = <></>;
	if (row?.source) {
		if (Array.isArray(row.source)) {
			const count = row.source.length;
			if (count === 1) {
				return (
					<>
						<Tooltip describeChild title={row.source[0]}>
							<span>{row.source[0].replace(fileRegex, "")}</span>
						</Tooltip>
						{unhiddenFindingWarning()}
					</>
				);
			}
			if (count > 1) {
				return (
					<>
						<Tooltip describeChild title={row.source.join(", ")}>
							<span>
								{row.source[0].replace(fileRegex, "")} +{" "}
								<Trans>{count - 1} more</Trans>
							</span>
						</Tooltip>
						{unhiddenFindingWarning()}
					</>
				);
			}
		} else {
			return (
				<>
					<Tooltip describeChild title={row.source}>
						<span>{row.source.replace(fileRegex, "")}</span>
					</Tooltip>
					{unhiddenFindingWarning()}
				</>
			);
		}
	}
	return files;
};

interface HiddenFindingForm {
	type: string;
	hideFor: "this" | "all";
	secretString?: string | null;
	// Luxon DateTime so we can manage time zone
	expires?: DateTime | null;
	reason: string;
}

// a11y list item
export const FindingListItem = (props: {
	id: string;
	label: React.ReactNode;
	value: React.ReactNode;
}) => {
	const { classes } = useStyles();
	const { id, label, value } = props;
	return (
		<li aria-labelledby={id}>
			<span className={classes.findingDetailsLabel} id={id}>
				{label}
			</span>
			<span>{value}</span>
		</li>
	);
};

export const HiddenFindingDialog = (props: {
	row?: RowDef | null;
	open: boolean;
	onClose: any;
}) => {
	const { classes, cx } = useStyles();
	const { i18n } = useLingui();
	const dispatch: AppDispatch = useDispatch();
	const hiddenFindingState = useSelector(
		(state: RootState) => state.hiddenFindings
	);
	const { row, open, onClose } = props;
	const [deleteConfirm, setDeleteConfirm] = useState(false);
	const [accordionExpanded, setAccordionExpanded] = useState(false);
	// set min date = tomorrow, so user can't create a hidden finding that immediately expires
	const dateMin = DateTime.utc().plus({ days: 1 });
	const dateMaxStr = "2050/12/31";
	const dateMax = DateTime.fromFormat(dateMaxStr, "yyyy/LL/dd", {
		zone: "utc",
	});
	let dialogTitle = i18n._(t`Hide This Finding`);
	if (deleteConfirm) {
		dialogTitle = i18n._(t`Remove Hidden Finding`);
	} else if (row?.hiddenFindings) {
		dialogTitle = i18n._(t`Modify Hidden Finding`);
	}

	const hiddenFindingFormSchema = Yup.object({
		type: Yup.string(),
		secretString: Yup.string().when(
			["type", "hideFor"],
			(type: any, hideFor: any) => {
				if ((type === "secret" || type === "secret_raw") && hideFor === "all") {
					return Yup.string()
						.required(i18n._(t`Required`))
						.min(4, i18n._(t`Must be 4 or more characters`));
				}
				return Yup.string();
			}
		),
		expires: Yup.date()
			.typeError(i18n._(t`Invalid date format`))
			.min(dateMin.toJSDate(), i18n._(t`Must be a future date`))
			.max(dateMax.toJSDate(), i18n._(t`Date must be before ${dateMaxStr}`))
			.nullable()
			.default(null),
		reason: Yup.string()
			.required(i18n._(t`Required`))
			.trim()
			.min(1, i18n._(t`Must be between 1-512 characters`))
			.max(512, i18n._(t`Must be between 1-512 characters`)),
	});

	// form submission succeeds, reset hiddingFinding redux status
	// and close the dialog
	// success notification will be viewed as a global app notification
	useEffect(() => {
		if (open) {
			switch (hiddenFindingState.status) {
				case "succeeded":
					dispatch(resetStatus());
					setDeleteConfirm(false);
					setAccordionExpanded(false);
					onClose();
					break;
			}
		}
	}, [open, hiddenFindingState.status, dispatch, onClose]);

	// short-circuit if dialog closed
	if (!open) {
		return <></>;
	}
	// required cell fields for display & form
	if (!row) {
		console.error("row undefined");
		return <></>;
	}
	if (!("type" in row) || typeof row?.type !== "string") {
		console.error("type undefined");
		return <></>;
	}
	if (!("url" in row) || typeof row?.url !== "string") {
		console.error("url undefined");
		return <></>;
	}

	const initialValues: HiddenFindingForm = {
		// DateTimePicker component handles transforming string => Luxon DateTime object
		// all associated findings should have same expiration date + reason, so use first occurrence
		type: row?.type,
		hideFor: row?.type.endsWith("_raw") ? "all" : "this",
		secretString:
			row?.type === "secret_raw" &&
			row?.hiddenFindings &&
			row.hiddenFindings.length
				? row.hiddenFindings[0].value?.value
				: "",
		expires:
			row?.hiddenFindings &&
			row.hiddenFindings.length &&
			row.hiddenFindings[0]?.expires
				? row.hiddenFindings[0].expires
				: null,
		reason:
			row?.hiddenFindings &&
			row.hiddenFindings.length &&
			row.hiddenFindings[0]?.reason
				? row.hiddenFindings[0].reason
				: "",
	};

	// add/update submit button clicked
	const onSubmit = (values: HiddenFindingForm) => {
		const url = row?.url + "/whitelist";
		const reason = values?.reason.trim() ?? "";
		let expires: string | undefined = undefined;
		if (values?.expires) {
			// value may be a string instead of Luxon DateTime if
			// coming from a saved value that hasn't been modified
			if (typeof values.expires === "string") {
				expires = values.expires;
			} else {
				// Luxon DateTime
				expires = values?.expires.toUTC().toJSON();
			}
		}

		let type = row?.type;
		if (values?.hideFor === "all" && !type.endsWith("_raw")) {
			type += "_raw";
		}

		let request: HiddenFindingsRequest;
		// update "global" fields (reason, expires) for each finding type
		if (row?.hiddenFindings && Array.isArray(row.hiddenFindings)) {
			row.hiddenFindings.forEach((hf: HiddenFinding) => {
				if (hf.type === type) {
					let data: HiddenFinding | {} = {};
					if (type === "secret_raw") {
						data = {
							value: {
								value: values?.secretString?.trim(),
							},
						};
					}
					request = {
						url: [url, hf.id].join("/"),
						// keep same data, just update expires, reason fields
						data: {
							...hf,
							...data,
							updated_by: row?.createdBy ?? undefined, // API doesn't return updated_by field, so infer current user made latest update
							expires: expires,
							reason: reason,
						},
					};
					dispatch(updateHiddenFinding(request));
				}
			});

			if (
				type === "vulnerability" &&
				row?.unhiddenFindings &&
				Array.isArray(row.unhiddenFindings)
			) {
				// add new hidden findings for each source file not covered by this hidden finding
				row.unhiddenFindings.forEach((source: string) => {
					const request: HiddenFindingsRequest = {
						url,
						data: {
							created_by: row?.createdBy ?? undefined,
							expires: expires,
							reason: reason,
							type: "vulnerability",
							value: {
								id: row?.id ?? row?.location, // vulnid can be different fields if this is viewed from vuln tab vs hidden findings tab
								component: row?.component ?? "",
								source,
							},
						},
					};
					dispatch(addHiddenFinding(request));
				});
			}
		} else {
			// create a new hidden finding per type (different value obj structures)
			let data = {
				// common fields for all allowlist objs
				created_by: row?.createdBy ?? undefined,
				expires: expires,
				reason: reason,
			};
			switch (type) {
				case "secret":
					request = {
						url,
						data: {
							...data,
							type: "secret",
							value: {
								filename: row?.filename ?? "",
								line: row?.line ?? "",
								commit: row?.commit ?? "",
							},
						},
					};
					dispatch(addHiddenFinding(request));
					break;
				case "secret_raw":
					request = {
						url,
						data: {
							...data,
							type: "secret_raw",
							value: {
								value: values?.secretString?.trim() ?? "",
							},
						},
					};
					dispatch(addHiddenFinding(request));
					break;
				case "static_analysis":
					request = {
						url,
						data: {
							...data,
							type: "static_analysis",
							value: {
								filename: row?.filename ?? "",
								line: row?.line ?? "",
								type: row?.resource ?? "",
							},
						},
					};
					dispatch(addHiddenFinding(request));
					break;
				case "vulnerability":
					if (row.source && Array.isArray(row.source)) {
						// create separate hidden finding for each source file
						row.source.forEach((source: string) => {
							const request: HiddenFindingsRequest = {
								url,
								data: {
									...data,
									type: "vulnerability",
									value: {
										id: row?.id ?? "",
										component: row?.component ?? "",
										source,
									},
								},
							};
							dispatch(addHiddenFinding(request));
						});
					} else {
						console.error(
							"unable to add or update vulnerability hidden finding"
						);
					}
					break;
				case "vulnerability_raw":
					request = {
						url,
						data: {
							...data,
							type: "vulnerability_raw",
							value: {
								id: row?.id ?? "",
							},
						},
					};
					dispatch(addHiddenFinding(request));
					break;
				default:
					console.error("unknown finding type");
					break;
			}
		}
		return;
	};

	// alert displayed in dialog if async form submission encounters errors
	const hiddenFindingAlert = (
		isSubmitting: boolean,
		setSubmitting: FormikHelpers<HiddenFindingForm>["setSubmitting"]
	) => {
		let alert = <></>;
		if (open && hiddenFindingState.status === "failed") {
			alert = (
				<Alert
					aria-label={i18n._(t`error`)}
					elevation={6}
					variant="filled"
					onClose={() => {
						dispatch(resetStatus());
					}}
					severity="error"
				>
					{hiddenFindingState.error}
				</Alert>
			);

			// form submitted and encountered an error
			// reset form submittion state (isSubmitting)
			// so form fields are editable again
			if (isSubmitting) {
				setSubmitting(false);
			}
		}
		return alert;
	};

	const findingDetails = (isRaw: boolean) => {
		let item = row;
		let createdBy = null;
		let created = null;
		let updatedBy = null;
		let updated = null;
		let type = row?.type;
		const warningTitle = i18n._(
			t`Click the "Update" button to add these source files to this hidden finding`
		);

		if (isRaw && (type === "vulnerability" || type === "secret")) {
			type += "_raw";
		}

		const hiddenFindingCount =
			row?.hiddenFindings && Array.isArray(row.hiddenFindings)
				? row.hiddenFindings.length
				: 0;
		let details = [
			<FindingListItem
				key="finding-details-category"
				id="finding-details-category"
				label={<Trans>Category:</Trans>}
				value={<FindingTypeChip value={type} />}
			/>,
		];

		if (hiddenFindingCount) {
			createdBy = row.hiddenFindings[0].created_by;
			created = row.hiddenFindings[0].created;
			updatedBy = row.hiddenFindings[0].updated_by;
			updated = row.hiddenFindings[0].updated;
			if (row.hiddenFindings[0].value) {
				item = row.hiddenFindings[0].value;
			}
		}

		if (updated) {
			details.unshift(
				<FindingListItem
					key="finding-details-updated-date"
					id="finding-details-updated-date"
					label={<Trans>Hidden finding last updated:</Trans>}
					value={formatDate(updated, "long")}
				/>
			);
		}

		if (updatedBy) {
			details.unshift(
				<FindingListItem
					key="finding-details-updated-by"
					id="finding-details-updated-by"
					label={<Trans>Hidden finding last updated by:</Trans>}
					value={<MailToLink recipient={updatedBy} text={updatedBy} tooltip />}
				/>
			);
		}

		if (created) {
			details.unshift(
				<FindingListItem
					key="finding-details-hidden-date"
					id="finding-details-hidden-date"
					label={<Trans>Hidden finding created:</Trans>}
					value={formatDate(created, "long")}
				/>
			);
		}

		// last unshifted item, so this will appear as first item in list
		if (createdBy) {
			details.unshift(
				<FindingListItem
					key="finding-details-hidden-by"
					id="finding-details-hidden-by"
					label={<Trans>Hidden finding created by:</Trans>}
					value={<MailToLink recipient={createdBy} text={createdBy} tooltip />}
				/>
			);
		}

		switch (type) {
			case "secret":
				if (item?.resource) {
					details.push(
						<FindingListItem
							key="finding-details-type"
							id="finding-details-type"
							label={<Trans>Type:</Trans>}
							value={capitalize(item?.resource)}
						/>
					);
				}
				details.push(
					<FindingListItem
						key="finding-details-commit"
						id="finding-details-commit"
						label={<Trans>Commit:</Trans>}
						value={item?.commit ?? ""}
					/>
				);
				details.push(
					<FindingListItem
						key="finding-details-fileline"
						id="finding-details-fileline"
						label={
							hiddenFindingCount ? (
								<Trans>Hidden in source file:</Trans>
							) : (
								<Trans>Found in source file:</Trans>
							)
						}
						value={
							<ul>
								<li>
									<span>
										<Trans>
											{item?.filename ?? ""} (Line {item?.line ?? ""})
										</Trans>
										<SourceCodeHotLink row={row} addTitle={true} />
									</span>
								</li>
							</ul>
						}
					/>
				);
				break;

			case "secret_raw":
				details.push(
					<FindingListItem
						key="finding-details-type"
						id="finding-details-type"
						label={<Trans>Type:</Trans>}
						value={
							<span className={classes.findingDetailsValueAny}>
								<Trans>Any</Trans>
							</span>
						}
					/>
				);
				details.push(
					<FindingListItem
						key="finding-details-commit"
						id="finding-details-commit"
						label={<Trans>Commit:</Trans>}
						value={
							<span className={classes.findingDetailsValueAny}>
								<Trans>Any</Trans>
							</span>
						}
					/>
				);
				details.push(
					<FindingListItem
						key="finding-details-fileline"
						id="finding-details-fileline"
						label={
							hiddenFindingCount ? (
								<Trans>Hidden in source file:</Trans>
							) : (
								<Trans>Found in source file:</Trans>
							)
						}
						value={
							<span className={classes.findingDetailsValueAny}>
								<Trans>Any</Trans>
							</span>
						}
					/>
				);
				break;

			case "static_analysis":
				if (item?.severity) {
					details.push(
						<FindingListItem
							key="finding-details-severity"
							id="finding-details-severity"
							label={<Trans>Severity:</Trans>}
							value={<SeverityChip value={row?.severity} />}
						/>
					);
				}
				details.push(
					<FindingListItem
						key="finding-details-resource"
						id="finding-details-resource"
						label={<Trans>Type:</Trans>}
						value={capitalize(item?.resource ?? item?.type ?? "")}
					/>
				);
				details.push(
					<FindingListItem
						key="finding-details-fileline"
						id="finding-details-fileline"
						label={
							hiddenFindingCount ? (
								<Trans>Hidden in source file:</Trans>
							) : (
								<Trans>Found in source file:</Trans>
							)
						}
						value={
							<ul>
								<li>
									<span>
										<Trans>
											{item?.filename ?? ""} (Line {item?.line ?? ""})
										</Trans>
										<SourceCodeHotLink row={row} addTitle={true} />
									</span>
								</li>
							</ul>
						}
					/>
				);
				break;

			case "vulnerability":
				if (item?.severity) {
					details.push(
						<FindingListItem
							key="finding-details-severity"
							id="finding-details-severity"
							label={<Trans>Severity:</Trans>}
							value={<SeverityChip value={row?.severity} />}
						/>
					);
				}
				details.push(
					<FindingListItem
						key="finding-details-vulnerability"
						id="finding-details-vulnerability"
						label={<Trans>Vulnerability:</Trans>}
						value={<VulnLink vulnId={item?.id} />}
					/>
				);
				details.push(
					<FindingListItem
						key="finding-details-component"
						id="finding-details-component"
						label={<Trans>Component:</Trans>}
						value={item?.component ?? ""}
					/>
				);
				if (hiddenFindingCount) {
					// viewing existing hidden finding
					details.push(
						<FindingListItem
							key="finding-details-files"
							id="finding-details-files"
							label={
								<Trans>Hidden in source files ({hiddenFindingCount}):</Trans>
							}
							value={
								<ol
									className={cx(
										classes.sourceFileList,
										classes.sourceFileListScrollable
									)}
								>
									{findingSourceFiles(row?.hiddenFindings)}
								</ol>
							}
						/>
					);
					if (
						row?.unhiddenFindings &&
						Array.isArray(row?.unhiddenFindings) &&
						row?.unhiddenFindings.length > 0
					) {
						details.push(
							<FindingListItem
								key="finding-details-unhidden-files"
								id="finding-details-unhidden-files"
								label={
									<span className={classes.fieldError}>
										<Trans>
											Source files <em>not</em> covered by this hidden finding (
											{row?.unhiddenFindings.length}):
										</Trans>
										<Tooltip title={warningTitle}>
											<ReportProblemOutlinedIcon
												className={classes.warningIcon}
												aria-label={warningTitle}
											/>
										</Tooltip>
									</span>
								}
								value={
									<ol
										className={cx(
											classes.sourceFileList,
											classes.sourceFileListScrollable,
											classes.fieldError
										)}
									>
										{sourceFiles(row?.unhiddenFindings as string[])}
									</ol>
								}
							/>
						);
					}
				} else {
					// viewing vuln details to add a new hidden finding
					details.push(
						<FindingListItem
							key="finding-details-files"
							id="finding-details-files"
							label={
								<Trans>
									Found in source files (
									{row?.source ? (row?.source as string[]).length : 0}):
								</Trans>
							}
							value={
								<ol
									className={cx(
										classes.sourceFileList,
										classes.sourceFileListScrollable
									)}
								>
									{sourceFiles(row?.source as string[])}
								</ol>
							}
						/>
					);
				}
				break;

			case "vulnerability_raw":
				if (item?.severity) {
					details.push(
						<FindingListItem
							key="finding-details-severity"
							id="finding-details-severity"
							label={<Trans>Severity:</Trans>}
							value={<SeverityChip value={row?.severity} />}
						/>
					);
				}
				details.push(
					<FindingListItem
						key="finding-details-vulnerability"
						id="finding-details-vulnerability"
						label={<Trans>Vulnerability:</Trans>}
						value={<VulnLink vulnId={item?.id} />}
					/>
				);
				details.push(
					<FindingListItem
						key="finding-details-component"
						id="finding-details-component"
						label={<Trans>Component:</Trans>}
						value={
							<span className={classes.findingDetailsValueAny}>
								<Trans>Any</Trans>
							</span>
						}
					/>
				);
				if (hiddenFindingCount) {
					// viewing existing hidden finding
					details.push(
						<FindingListItem
							key="finding-details-files"
							id="finding-details-files"
							label={<Trans>Hidden in source files:</Trans>}
							value={
								<span className={classes.findingDetailsValueAny}>
									<Trans>Any</Trans>
								</span>
							}
						/>
					);
				} else {
					// viewing vuln details to add a new hidden finding
					details.push(
						<FindingListItem
							key="finding-details-files"
							id="finding-details-files"
							label={<Trans>Found in source files:</Trans>}
							value={
								<span className={classes.findingDetailsValueAny}>
									<Trans>Any</Trans>
								</span>
							}
						/>
					);
				}
				break;
		}
		return details;
	};

	const dialogChildren = () => {
		return (
			<>
				{/* note: validateOnMount=true on edit so form will disable "Update button" if expiration is invalid date (already expired) */}
				<Formik
					initialValues={initialValues}
					validationSchema={hiddenFindingFormSchema}
					onSubmit={onSubmit}
					validateOnMount={row?.hiddenFindings}
				>
					{({
						submitForm,
						isValid,
						isSubmitting,
						dirty,
						setSubmitting,
						values,
					}) => (
						<Form noValidate autoComplete="off">
							{hiddenFindingAlert(isSubmitting, setSubmitting)}
							{/* replace dialog content+actions with delete confirmation */}
							{deleteConfirm ? (
								<>
									<DialogContent dividers={true}>
										<Box>
											<Trans>
												Remove this hidden finding? This finding will again
												appear in scan results for this repository.
											</Trans>
										</Box>
									</DialogContent>
									{hiddenFindingState.status === "loading" && (
										<LinearProgress />
									)}
									<DialogActions>
										<Box displayPrint="none" className={classes.dialogButtons}>
											<RedButton
												variant="contained"
												disabled={hiddenFindingState.status === "loading"}
												startIcon={<DeleteIcon />}
												aria-busy={hiddenFindingState.action === "delete"}
												onClick={() => {
													if (
														row?.url &&
														row?.hiddenFindings &&
														Array.isArray(row.hiddenFindings)
													) {
														row.hiddenFindings.forEach((hf: HiddenFinding) => {
															const request: HiddenFindingsRequest = {
																url: `${row?.url}/whitelist/${hf.id}`,
															};
															dispatch(deleteHiddenFinding(request));
														});
													} else {
														console.error("url or finding id undefined");
													}
												}}
											>
												{hiddenFindingState.action === "delete" ? (
													<Trans>Removing...</Trans>
												) : (
													<Trans>Remove</Trans>
												)}
											</RedButton>

											<Button
												color="primary"
												disabled={hiddenFindingState.status === "loading"}
												onClick={() => {
													setDeleteConfirm(false);
												}}
											>
												<Trans>Cancel</Trans>
											</Button>
										</Box>
									</DialogActions>
								</>
							) : (
								<>
									{/* dialog content + actions for adding/updating/removing a hidden finding item */}
									<DialogContent dividers={true}>
										<FindingAccordion
											expanded={accordionExpanded}
											onChange={() => {
												setAccordionExpanded(!accordionExpanded);
											}}
											elevation={0}
											square={true}
										>
											<FindingAccordionSummary
												aria-controls="finding-info-section-content"
												id="finding-info-section-header"
											>
												<Tooltip
													title={i18n._(t`Click for more information`)}
													aria-hidden={true}
												>
													<HelpIcon className={classes.helpIcon} />
												</Tooltip>
												<Typography className={classes.heading}>
													<Trans>What are hidden findings?</Trans>
												</Typography>
											</FindingAccordionSummary>
											<AccordionDetails>
												<Trans>
													<ul className={classes.findingHelpList}>
														<li key="finding-rules-1">
															Hidden findings are global to this repository.
															They will be applied to <i>all</i> scan results
															for this repository (past, present, future, and
															for all branches), with the exception of "Secret
															Raw" types, that will only apply to future scans
														</li>
														<li key="finding-rules-2">
															Findings can be hidden on the applicable finding
															type scan results tab ("Vulnerability", "Static
															Analysis", "Secrets")
														</li>
														<li key="finding-rules-3">
															Once a finding is hidden, it can be viewed or
															managed (removed/modified) on the "Hidden
															Findings" scan results tab
														</li>
														<li key="finding-rules-4">
															Hiding a finding <i>DOES NOT</i> remediate the
															underlying security issue, it <i>only</i> prevents
															it from appearing in scan results. Hidden findings
															allow hiding of false-positive (F+) results or to
															temporarily hide a finding that does not yet have
															an upstream vendor fix available
														</li>
													</ul>
												</Trans>
											</AccordionDetails>
										</FindingAccordion>

										<Box className={classes.findingDetailsBox}>
											<Typography variant="body1">
												<Trans>Finding Details</Trans>
											</Typography>
											<Typography variant="body2">
												<ul className={classes.findingDetails}>
													{findingDetails(values.hideFor === "all")}
												</ul>
											</Typography>
										</Box>
										<Divider className={classes.divider} />
										<Box>
											<FormLabel component="legend">
												<Trans>
													Include a clear and meaningful reason for why this
													finding is being hidden
												</Trans>
											</FormLabel>
											<Field
												id="reason"
												name="reason"
												type="text"
												maxRows="3"
												className={classes.findingFormField}
												autoFocus
												inputProps={{ maxLength: 512 }}
												component={TextField}
												variant="outlined"
												label={i18n._(t`Reason`)}
												placeholder={i18n._(
													t`Justification for hiding this security finding`
												)}
												fullWidth
												multiline={true}
											/>
										</Box>
										{/* only provide option to assign standard or raw typed in "add" mode, not "edit" */}
										{(row.type === "vulnerability" ||
											row.type === "vulnerability_raw" ||
											row.type === "secret" ||
											row.type === "secret_raw") && (
											<Box className={classes.findingFormSelectField}>
												<FormControl variant="outlined">
													{/*
													 * Note: MUIv5 requires a label on the form field and also an independent InputLabel for a11y access to that field
													 * adding the InputLabel creates an extra visual label that overlaps the field value,
													 * so keep it for a11y, but add CSS "display: none" to hide it
													 */}
													<InputLabel
														id="hide-for-label"
														style={{ display: "none" }}
													>
														<Trans>Hide For</Trans>
													</InputLabel>
													<Field
														component={Select}
														name="hideFor"
														labelId="hide-for-label"
														id="hide-for"
														label={i18n._(t`Hide For`)}
														fullWidth
														disabled={!!row?.hiddenFindings}
													>
														<MenuItem value={"this"}>
															{row.type === "vulnerability" ||
															row.type === "vulnerability_raw" ? (
																<Trans>
																	This vulnerability in THIS component
																</Trans>
															) : (
																<Trans>
																	This secret in THIS specific location
																</Trans>
															)}
														</MenuItem>
														<MenuItem value={"all"}>
															{row.type === "vulnerability" ||
															row.type === "vulnerability_raw" ? (
																<Trans>
																	This vulnerability in ALL components
																</Trans>
															) : (
																<Trans>
																	This secret ANYWHERE in this repository
																</Trans>
															)}
														</MenuItem>
													</Field>
												</FormControl>
												{(row.type === "secret" || row.type === "secret_raw") &&
													values.hideFor === "all" && (
														<Field
															id="secret-string"
															name="secretString"
															type="text"
															component={TextField}
															className={classes.findingFormStringField}
															label={i18n._(
																t`String to exclude from secret findings (future scans only)`
															)}
															variant="outlined"
															placeholder={i18n._(
																t`This should not be a real secret`
															)}
														/>
													)}
											</Box>
										)}
										<Box className={classes.findingFormSelectField}>
											<Field
												id="expires"
												name="expires"
												className={classes.findingFormField}
												label={i18n._(t`Expires (optional)`)}
												style={{ width: "100%" }}
												disablePast
												component={DatePickerField}
												inputVariant="outlined"
												ampm={false}
												inputFormat="yyyy/LL/dd HH:mm"
												placeholder={i18n._(t`yyyy/MM/dd HH:mm (24-hour)`)}
												mask="____/__/__ __:__"
											/>
										</Box>
									</DialogContent>
									{hiddenFindingState.status === "loading" && (
										<LinearProgress />
									)}
									<DialogActions>
										{!isValid && (
											<Alert variant="outlined" severity="error">
												<Trans>
													This form contains unresolved errors. Please resolve
													these errors
												</Trans>
											</Alert>
										)}

										<Box displayPrint="none" className={classes.dialogButtons}>
											{row?.hiddenFindings && (
												<RedButton
													variant="contained"
													disabled={hiddenFindingState.status === "loading"}
													startIcon={<DeleteIcon />}
													aria-busy={hiddenFindingState.action === "delete"}
													onClick={() => {
														if (
															row?.url &&
															row?.hiddenFindings &&
															Array.isArray(row.hiddenFindings)
														) {
															setDeleteConfirm(true);
														} else {
															console.error("url or finding id undefined");
														}
													}}
												>
													<Trans>Remove</Trans>
												</RedButton>
											)}

											<Button
												variant="contained"
												color="primary"
												startIcon={
													row?.hiddenFindings ? (
														<EditIcon />
													) : (
														<AddCircleOutlineIcon />
													)
												}
												aria-busy={
													hiddenFindingState.action === "add" ||
													hiddenFindingState.action === "update"
												}
												disabled={
													hiddenFindingState.status === "loading" ||
													!isValid ||
													(!row?.hiddenFindings && !dirty)
												}
												onClick={() => {
													if (isValid) {
														submitForm();
													} else {
														// we shouldn't get here since form validates as user enters input
														console.error("form validation failed");
													}
												}}
											>
												{row?.hiddenFindings ? (
													hiddenFindingState.action === "update" ? (
														<Trans>Updating...</Trans>
													) : (
														<Trans>Update</Trans>
													)
												) : hiddenFindingState.action === "add" ? (
													<Trans>Adding...</Trans>
												) : (
													<Trans>Add</Trans>
												)}
											</Button>

											<Button
												color="primary"
												disabled={hiddenFindingState.status === "loading"}
												onClick={() => {
													setAccordionExpanded(false);
													onClose();
												}}
											>
												<Trans>Cancel</Trans>
											</Button>
										</Box>
									</DialogActions>
								</>
							)}
						</Form>
					)}
				</Formik>
			</>
		);
	};

	return (
		<DraggableDialog
			open={open}
			onClose={() => {
				onClose();
			}}
			title={dialogTitle}
			maxWidth="md"
		>
			<>{dialogChildren()}</>
		</DraggableDialog>
	);
};

const HiddenFindingCell = (props: { row?: RowDef | null }) => {
	const { i18n } = useLingui();
	const { classes } = useStyles();
	const dispatch: AppDispatch = useDispatch();
	const { row } = props;
	const [dialogOpen, setDialogOpen] = useState(false);

	let CellButton = <VisibilityIcon />;
	let title = i18n._(t`Hide this finding`);
	let warnings = [];
	if (row?.hiddenFindings && row?.hiddenFindings.length > 0) {
		CellButton = <VisibilityOffIcon />;
		title = i18n._(t`Modify hidden finding`);

		// source files not covered by this hidden finding
		if (
			row?.unhiddenFindings &&
			Array.isArray(row?.unhiddenFindings) &&
			row?.unhiddenFindings.length
		) {
			warnings.push(
				plural(row?.unhiddenFindings.length, {
					one: "# Source file not covered by this hidden finding",
					other: "# Source files not covered by this hidden finding",
				})
			);
		}
		// check expiration on each hidden finding to see if it's expired
		for (let i = 0; i < row?.hiddenFindings.length; i += 1) {
			if (row?.hiddenFindings[i].expires) {
				const expirationDate = DateTime.fromISO(row?.hiddenFindings[i].expires);
				const diff = expirationDate.diffNow();
				if (diff.milliseconds < 0) {
					warnings.push(i18n._(t`This item has expired`));
					break;
				}
			}
		}
	}

	return (
		<div>
			<Tooltip title={title}>
				<span>
					<IconButton
						size="small"
						color="primary"
						aria-label={title}
						onClick={(event: React.SyntheticEvent) => {
							event.stopPropagation();
							// reset finding load state to idle so dialog stays open (refer to HiddenFindingDialog useEffect auto-close)
							dispatch(resetStatus());
							setDialogOpen(true);
						}}
					>
						{CellButton}
					</IconButton>
				</span>
			</Tooltip>
			{warnings.length > 0 && (
				<Tooltip title={warnings.join(", ")}>
					<ReportProblemOutlinedIcon
						className={classes.warningIcon}
						aria-label={warnings.join(", ")}
					/>
				</Tooltip>
			)}
			<HiddenFindingDialog
				row={row}
				open={dialogOpen}
				onClose={() => {
					setDialogOpen(false);
				}}
			/>
		</div>
	);
};

interface ChartData {
	name: string;
	value: number;
	color: string;
}

type TabChangerFunction = () => void;

interface OverviewCardProps {
	titleText: string;
	titleIcon: React.ReactNode;
	scanOptionWasNotRun: boolean;
	chartData: ChartData[];
	nothingFoundText: string;
	hasExtraText?: boolean;
	extraText?: string;
	tabChanger?: TabChangerFunction | undefined;
	isTabDisabled: boolean;
}

export const OverviewCard = ({
	titleText,
	titleIcon,
	scanOptionWasNotRun,
	tabChanger,
	chartData,
	nothingFoundText,
	hasExtraText = false,
	extraText,
	isTabDisabled,
}: OverviewCardProps) => {
	const { classes } = useStyles();

	const countFound = chartData.reduce((prev, curr) => {
		return prev + curr.value;
	}, 0);
	const nothingFound = countFound === 0;

	return (
		<Grid item xs={6} sm={4}>
			<Card
				elevation={2}
				className={classes.overviewCard}
				style={isTabDisabled ? {} : { cursor: "pointer" }}
				onClick={
					!isTabDisabled ? tabChanger && (() => tabChanger()) : undefined
				}
			>
				<CardContent>
					<Typography
						variant="h5" // styles
						component="h3" // html element
						color={scanOptionWasNotRun ? "textSecondary" : "primary"}
						className={classes.ocTitle}
					>
						<span className={classes.ocTitleIcon}>{titleIcon}</span>
						{scanOptionWasNotRun ? <i>{titleText}</i> : titleText}
					</Typography>
					<div className={classes.ocContainer}>
						{scanOptionWasNotRun && (
							<Typography
								variant="h6"
								component="h4"
								align="center"
								color="textSecondary"
							>
								<i>
									<Trans>This scan option was not used</Trans>
								</i>
							</Typography>
						)}
						{!scanOptionWasNotRun && nothingFound && (
							<Typography
								variant="h6"
								component="h4"
								align="center"
								color="textSecondary"
							>
								{nothingFoundText}
							</Typography>
						)}
						{!scanOptionWasNotRun && !nothingFound && (
							<div
								className={classes.oneHundredPercent}
								data-testid="a-donut-chart"
							>
								<ResponsiveContainer width="100%" height={240}>
									<PieChart style={{ cursor: "pointer" }}>
										<Pie
											startAngle={180}
											endAngle={0}
											data={chartData}
											nameKey="name"
											dataKey="value"
											cx="50%"
											cy="70%"
											innerRadius="60%"
											outerRadius="85%"
											isAnimationActive={false}
											label
											paddingAngle={5}
										>
											{chartData.map((entry) => (
												<Cell fill={entry.color} key={entry.name} />
											))}
										</Pie>
										<Legend iconType="circle" />
									</PieChart>
								</ResponsiveContainer>
							</div>
						)}
					</div>
					{!scanOptionWasNotRun && hasExtraText && (
						<Tooltip describeChild title={extraText || ""}>
							<Typography
								variant="h6"
								component="h4"
								align="center"
								color="textSecondary"
								className={classes.ocExtraTextArea}
							>
								{extraText}
							</Typography>
						</Tooltip>
					)}
				</CardContent>
			</Card>
		</Grid>
	);
};

export const ScanMessages = (props: {
	messages?: ScanErrors;
	severity?: "error" | "warning";
	startExpanded?: boolean;
}) => {
	const { classes, cx } = useStyles();
	const { messages, severity = "warning", startExpanded = false } = props;
	const [accordionExpanded, setAccordionExpanded] = useState(startExpanded);
	const title =
		severity === "warning" ? (
			<Trans>Scan Warnings</Trans>
		) : (
			<Trans>Scan Errors</Trans>
		);
	const icon =
		severity === "warning" ? (
			<ReportProblemOutlinedIcon
				className={cx(classes.helpIcon, classes.alertIconWarning)}
			/>
		) : (
			<ErrorOutlinedIcon
				className={cx(classes.helpIcon, classes.alertIconError)}
			/>
		);
	const alertTitleClass =
		severity === "warning" ? classes.alertTextWarning : classes.alertTextError;

	let messageTexts = null;
	if (messages && Object.entries(messages).length > 0) {
		messageTexts = messages
			? Object.entries(messages).map((errArr) => {
					if (errArr.length > 1) {
						return (
							errArr[0] +
							": " +
							(Array.isArray(errArr[1]) ? errArr[1].join(", ") : errArr[1])
						);
					}
					return errArr[0];
			  })
			: null;
	}
	return (
		<>
			{messageTexts && (
				<Box displayPrint="none">
					<Accordion
						expanded={accordionExpanded}
						onChange={() => {
							setAccordionExpanded(!accordionExpanded);
						}}
					>
						<AccordionSummary
							className={classes.accordionSummary}
							expandIcon={
								<Box displayPrint="none">
									<ExpandMoreIcon />
								</Box>
							}
							aria-controls="scan-errors-section-content"
							id="scan-errors-section-header"
						>
							{icon}
							<Typography className={cx(classes.heading, alertTitleClass)}>
								{title} ({messageTexts.length})
							</Typography>
						</AccordionSummary>

						<AccordionDetails
							className={cx(
								classes.accordionDetails,
								classes.scanMessagesAccordionDetails
							)}
						>
							<Grid className={classes.scanErrorsContainer}>
								{messageTexts.map((txt) => (
									<Alert
										severity={severity}
										className={classes.scanErrorAlert}
										key={txt}
										icon={false}
									>
										{txt}
									</Alert>
								))}
							</Grid>
						</AccordionDetails>
					</Accordion>
				</Box>
			)}
		</>
	);
};

export const OverviewTabContent = (props: {
	scan: AnalysisReport;
	hfRows: RowDef[];
	tabChanger?: Function;
	sharedColors: string[];
	tabsStatus: {
		isDisabledVulns: boolean;
		isDisabledStat: boolean;
		isDisabledSecrets: boolean;
		isDisabledInventory: boolean;
		isDisabledHFs: boolean;
	};
}) => {
	const { i18n } = useLingui();
	const { hfRows, scan, tabChanger, sharedColors, tabsStatus } = props;
	const { results_summary, errors, alerts } = scan;

	const defaultSevLevObject: SeverityLevels = {
		critical: 0,
		high: 0,
		medium: 0,
		low: 0,
		negligible: 0,
		"": 0,
	};

	const defaultSecretFindingResult: SecretFindingResult = {};

	const vulns = results_summary?.vulnerabilities ?? defaultSevLevObject;
	const statAnalysis = results_summary?.static_analysis ?? defaultSevLevObject;
	const secrets = scan.results?.secrets ?? defaultSecretFindingResult;
	const techDiscovered = scan.results?.inventory?.technology_discovery ?? {};

	interface NameTransType {
		[key: string]: string;
	}

	const nameTrans: NameTransType = {
		critical: t`critical`,
		high: t`high`,
		medium: t`medium`,
		low: t`low`,
		negligible: t`negligible`,
	};

	// chart data selecting and formatting
	const vulnsChartData = Object.entries(vulns).map((v) => ({
		name: v[0] in nameTrans ? nameTrans[v[0]] : i18n._(t`not specified`),
		value: v[1],
		color: getVulnColor(v[0]),
	}));

	const statAnalysisChartData = Object.entries(statAnalysis).map((sa) => ({
		name: sa[0] in nameTrans ? nameTrans[sa[0]] : i18n._(t`not specified`),
		value: sa[1],
		color: getVulnColor(sa[0]),
	}));

	let dictSecrets: { [type: string]: number } = {};
	Object.values(secrets).forEach((arr) => {
		arr.forEach((secObject) => {
			const { type } = secObject;
			dictSecrets[type] ? (dictSecrets[type] += 1) : (dictSecrets[type] = 1);
			return;
		});
	});

	const secretsSummarizedChartData = Object.entries(dictSecrets)
		.sort((aArr, bArr) => bArr[1] - aArr[1])
		.map((sec, i) => ({
			name: sec[0],
			value: Number(sec[1]),
			color: sharedColors[i % sharedColors.length],
		}));

	const techDiscoveredChartData = Object.entries(techDiscovered)
		.sort((aObj, bObj) => {
			return bObj[1] - aObj[1];
		})
		.map((tech, i) => ({
			name: tech[0],
			value: tech[1],
			color: sharedColors[i % sharedColors.length],
		}));

	const baseImagesSummarized = Object.keys(
		scan.results?.inventory?.base_images ?? {}
	).sort((a, b) => a.localeCompare(b));

	const techInventoryExtraText = baseImagesSummarized.length
		? i18n._(t`Images:`) + " " + baseImagesSummarized.join(", ")
		: i18n._(t`No images detected`);

	const hfDict = hfRows.reduce((prev, curr) => {
		const t = curr["type"];
		prev[t] ? (prev[t] += 1) : (prev[t] = 1);
		return prev;
	}, {});

	const hfChartData = Object.entries(hfDict)
		.sort((aArr, bArr) => {
			return bArr[1] - aArr[1];
		})
		.map((hf, i) => ({
			name: hf[0],
			value: Number(hf[1]),
			color: sharedColors[i % sharedColors.length],
		}));

	const hfCount = hfChartData.reduce((prev, curr) => {
		return prev + curr.value;
	}, 0);

	const hiddenFindingsExtraText = plural(hfCount, {
		one: `${hfCount} hidden finding`,
		other: `${hfCount} hidden findings`,
	});

	return (
		<>
			<ScanMessages messages={errors} severity="error" startExpanded={true} />
			<ScanMessages messages={alerts} severity="warning" />

			<Grid container spacing={1}>
				<OverviewCard
					titleText={i18n._(t`Vulnerabilities`)}
					titleIcon={<SecurityIcon />}
					scanOptionWasNotRun={results_summary?.vulnerabilities === null}
					chartData={vulnsChartData}
					nothingFoundText={i18n._(t`No vulnerabilities detected`)}
					tabChanger={tabChanger && (() => tabChanger(1))}
					isTabDisabled={tabsStatus.isDisabledVulns}
				/>
				<OverviewCard
					titleText={i18n._(t`Static Analysis`)}
					titleIcon={<BugReportIcon />}
					scanOptionWasNotRun={results_summary?.static_analysis === null}
					chartData={statAnalysisChartData}
					nothingFoundText={i18n._(t`No static analysis findings detected`)}
					tabChanger={tabChanger && (() => tabChanger(2))}
					isTabDisabled={tabsStatus.isDisabledStat}
				/>
				<OverviewCard
					titleText={i18n._(t`Secrets`)}
					titleIcon={<VpnKeyIcon />}
					scanOptionWasNotRun={results_summary?.secrets === null}
					chartData={secretsSummarizedChartData}
					nothingFoundText={i18n._(t`No secrets detected`)}
					tabChanger={tabChanger && (() => tabChanger(3))}
					isTabDisabled={tabsStatus.isDisabledSecrets}
				/>
				<OverviewCard
					titleText={i18n._(t`Inventory`)}
					titleIcon={<LayersIcon />}
					scanOptionWasNotRun={results_summary?.inventory === null}
					chartData={techDiscoveredChartData}
					nothingFoundText={i18n._(t`No technology inventory detected`)}
					hasExtraText={true}
					extraText={techInventoryExtraText}
					tabChanger={tabChanger && (() => tabChanger(4))}
					isTabDisabled={tabsStatus.isDisabledInventory}
				/>
				<OverviewCard
					titleText={i18n._(t`Hidden Findings`)}
					titleIcon={<VisibilityOffIcon />}
					scanOptionWasNotRun={false} // "always runs"
					chartData={hfChartData}
					nothingFoundText={i18n._(t`No findings are hidden`)}
					hasExtraText={true}
					extraText={hiddenFindingsExtraText}
					tabChanger={tabChanger && (() => tabChanger(6))}
					isTabDisabled={tabsStatus.isDisabledHFs}
				/>
			</Grid>
		</>
	);
};

function getVulnColor(vulnSeverity: string) {
	switch (vulnSeverity) {
		case "critical":
			return colorCritical;
		case "high":
			return colorHigh;
		case "medium":
			return colorMedium;
		case "low":
			return colorLow;
		case "negligible":
			return colorNegligible;
		case "":
			return colorNegligible;
		default:
			console.warn(`Unexpected vulnerability severity found: ${vulnSeverity}`);
			return colorNegligible;
	}
}

const FindingDialogActions = (props: {
	row?: RowDef | null;
	onClose: any;
	onFindingHidden: any;
}) => {
	const { classes } = useStyles();
	const dispatch: AppDispatch = useDispatch();
	const { row, onClose, onFindingHidden } = props;

	const onClickHideFinding = () => {
		dispatch(resetStatus());
		onFindingHidden();
		onClose();
	};

	return (
		<DialogActions>
			<Box displayPrint="none" className={classes.dialogButtons}>
				{row?.hiddenFindings ? (
					<Button
						color="primary"
						startIcon={<VisibilityOffIcon />}
						autoFocus
						onClick={() => onClickHideFinding()}
					>
						<Trans>Modify Hidden Finding</Trans>
					</Button>
				) : (
					<Button
						color="primary"
						startIcon={<VisibilityIcon />}
						autoFocus
						onClick={() => onClickHideFinding()}
					>
						<Trans>Hide This Finding</Trans>
					</Button>
				)}

				<Button color="primary" onClick={() => onClose()}>
					<Trans>OK</Trans>
				</Button>
			</Box>
		</DialogActions>
	);
};

interface FilterFieldProps {
	field: string;
	label: string;
	value?: string | string[];
	autoFocus?: boolean;
	onClear: (field: string) => void;
	onChange: (field: string, value: string) => void;
}

const FilterField = (props: FilterFieldProps) => {
	const { i18n } = useLingui();
	const { classes } = useStyles();
	const {
		field,
		label,
		value = "",
		autoFocus = false,
		onClear,
		onChange,
	} = props;
	// maintain an internal field value
	// so we can echo user input
	// but then debounce changing the filter value and invoking a table filter operation
	const [fieldValue, setFieldValue] = useState(value);
	const debounceRef = useRef<NodeJS.Timeout | null>(null);
	const debounceMs = 350;

	useEffect(() => {
		setFieldValue(value);
		return () => {
			if (debounceRef && debounceRef.current) {
				clearTimeout(debounceRef.current);
				debounceRef.current = null;
			}
		};
	}, [value]);

	const handleMouseDownClear = (event: { preventDefault: () => void }) => {
		event.preventDefault();
	};

	const handleOnClickClear = () => {
		onClear(field);
	};

	const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = event.target.value;
		if (debounceRef && debounceRef.current) {
			clearTimeout(debounceRef.current);
		}
		setFieldValue(newValue);
		debounceRef.current = setTimeout(() => {
			onChange(field, newValue);
			debounceRef.current = null;
		}, debounceMs);
	};

	return (
		<MuiTextField
			id={`filter-${field}`}
			name={`filter-${field}`}
			variant="outlined"
			autoFocus={autoFocus}
			value={fieldValue}
			size="small"
			style={{ maxWidth: "13em" }}
			label={label}
			InputProps={{
				className: classes.filterField,
				autoComplete: "off",
				startAdornment: (
					<InputAdornment position="start">
						<FilterListIcon />
					</InputAdornment>
				),
				endAdornment: value && (
					<InputAdornment position="end">
						<IconButton
							aria-label={i18n._(t`Clear field`)}
							onClick={handleOnClickClear}
							onMouseDown={handleMouseDownClear}
							edge="end"
							size="small"
						>
							<ClearIcon fontSize="small" />
						</IconButton>
					</InputAdornment>
				),
			}}
			onChange={handleOnChange}
		/>
	);
};

interface SeverityFilterFieldProps {
	value?: string | string[];
	summary?: SeverityLevels | null;
	autoFocus?: boolean;
	onChange: (field: string, value: string) => void;
}

const SeverityFilterField = (props: SeverityFilterFieldProps) => {
	const { i18n } = useLingui();
	const { classes } = useStyles();
	const { value = "", summary, autoFocus = false, onChange } = props;

	return (
		<MuiTextField
			select
			id="filter-severity"
			name="filter-severity"
			label={i18n._(t`Severity`)}
			variant="outlined"
			autoFocus={autoFocus}
			value={value}
			size="small"
			className={classes.selectFilter}
			onChange={(event) => {
				onChange("severity", event.target.value);
			}}
			InputProps={{
				className: classes.filterField,
				startAdornment: (
					<InputAdornment position="start">
						<FilterListIcon />
					</InputAdornment>
				),
			}}
		>
			<MenuItem value="">
				<i>
					<Trans>None</Trans>
				</i>
			</MenuItem>
			<MenuItem value="negligible">
				<SeverityChip value="negligible" count={summary?.negligible} />
			</MenuItem>
			<MenuItem value="low">
				<SeverityChip value="low" count={summary?.low} />
			</MenuItem>
			<MenuItem value="medium">
				<SeverityChip value="medium" count={summary?.medium} />
			</MenuItem>
			<MenuItem value="high">
				<SeverityChip value="high" count={summary?.high} />
			</MenuItem>
			<MenuItem value="critical">
				<SeverityChip value="critical" count={summary?.critical} />
			</MenuItem>
		</MuiTextField>
	);
};

const sourceFiles = (source?: string[]) => {
	if (source) {
		return source.map((source: string, index: number) => (
			<li key={"source-file-" + index.toString()}>{source}</li>
		));
	}
	return <></>;
};

const findingSourceFiles = (findings?: HiddenFinding[]) => {
	if (findings && findings.length > 0 && findings[0].type === "vulnerability") {
		return findings.map((finding: HiddenFinding, index: number) => {
			if (finding.type === "vulnerability") {
				return (
					<li key={"finding-source-file-" + index.toString()}>
						{finding.value.source}
					</li>
				);
			}
			return <></>;
		});
	}
	return <></>;
};

export const VulnLink = (props: { vulnId: string; addTitle?: boolean }) => {
	const { classes } = useStyles();
	const { i18n } = useLingui();
	const { vulnId, addTitle } = props;
	const cveIdRegex = /^CVE-\d{4}-\d{4,8}$/;
	// strict www regex for now, only allow alphanum, _, ., /, &, =, -, prefixed with https://
	// we can expand this if new vulnids are added later
	const wwwAllowed = /^https:\/\/[\w./&=-]+$/;

	let link = <></>;
	let url = null;
	// note: use i18n instead of <Trans> element for tooltip title
	// otherwise, a11y can't determine the title properly
	let text = addTitle ? (
		<Trans>View in the National Vulnerability Database</Trans>
	) : (
		i18n._(t`View in the National Vulnerability Database`)
	);

	if (cveIdRegex.test(vulnId)) {
		url = `https://nvd.nist.gov/vuln/detail/${vulnId}`;
	} else if (wwwAllowed.test(vulnId)) {
		url = vulnId;
		text = addTitle ? (
			<Trans>View in external site</Trans>
		) : (
			i18n._(t`View in external site`)
		);
	}

	if (url) {
		if (addTitle) {
			link = (
				<Button
					startIcon={<OpenInNewIcon />}
					href={url}
					target="_blank"
					rel="noopener noreferrer nofollow"
					size="small"
				>
					{text}
				</Button>
			);
		} else {
			link = (
				<Tooltip describeChild title={text}>
					<span>
						<Button
							endIcon={<OpenInNewIcon />}
							href={url}
							target="_blank"
							rel="noopener noreferrer nofollow"
							size="small"
							className={classes.vulnLinkButton}
						>
							{vulnId}
						</Button>
					</span>
				</Tooltip>
			);
		}
	} else if (!addTitle) {
		link = <>{vulnId}</>;
	}
	return link;
};

export const VulnTabContent = (props: {
	scan: AnalysisReport;
	hiddenFindings: HiddenFinding[];
	currentUser: User;
}) => {
	const { classes } = useStyles();
	const { i18n } = useLingui();
	const { scan, hiddenFindings, currentUser } = props;
	const [selectedRow, setSelectedRow] = useState<RowDef | null>(null);
	const [selectedRowNum, setSelectedRowNum] = useState<number | null>(null);
	const [hideRowNum, setHideRowNum] = useState<number | null>(null);
	const [filters, setFilters] = useState<FilterDef>({
		component: {
			filter: "",
		},
		id: {
			filter: "",
		},
		severity: {
			filter: "",
		},
	});

	const dialogTitle = (): string => {
		let title = selectedRow?.id ?? "";
		if (selectedRow?.component) {
			title =
				title + " : " + capitalize((selectedRow?.component as string) ?? "");
		}
		return title as string;
	};

	const vulnDialogContent = () => {
		return (
			<>
				<DialogContent dividers={true}>
					<span>
						<SeverityChip value={selectedRow?.severity} />{" "}
						<VulnLink vulnId={selectedRow?.id} addTitle={true} />
					</span>
					<Grid container spacing={3}>
						{/* left column */}
						<Grid item xs={6} className={classes.tabDialogGrid}>
							<List>
								{/* TODO: consider making long individual list items scroll instead of scrolling all dialog content */}
								<ListItem key="vuln-description">
									<ListItemText
										primary={
											<>
												{i18n._(t`Description`)}
												{selectedRow?.description && (
													<CustomCopyToClipboard
														copyTarget={selectedRow?.description}
													/>
												)}
											</>
										}
										secondary={selectedRow?.description ?? ""}
									/>
								</ListItem>
								<ListItem key="vuln-remediation">
									<ListItemText
										primary={
											<>
												{i18n._(t`Remediation`)}
												{selectedRow?.remediation && (
													<CustomCopyToClipboard
														copyTarget={selectedRow?.remediation}
													/>
												)}
											</>
										}
										secondary={selectedRow?.remediation ?? ""}
									/>
								</ListItem>
							</List>
						</Grid>

						{/* right column */}
						<Grid item xs={6}>
							<List>
								<ListItem key="vuln-source">
									<ListItemText
										primary={
											<>
												{i18n._(t`Found in Source Files`) +
													` (${
														selectedRow?.source
															? (selectedRow?.source as string[]).length
															: 0
													})`}{" "}
												{selectedRow?.source && (
													<CustomCopyToClipboard
														copyTarget={selectedRow?.source as string[]}
													/>
												)}
											</>
										}
										secondary={
											/* list of source files */
											<ol className={classes.sourceFileList}>
												{sourceFiles(selectedRow?.source as string[])}
											</ol>
										}
									/>
								</ListItem>
							</List>
						</Grid>
					</Grid>
				</DialogContent>
				<FindingDialogActions
					row={selectedRow}
					onClose={() => onRowSelect(null)}
					onFindingHidden={() => {
						setHideRowNum(selectedRowNum);
					}}
				/>
			</>
		);
	};

	const columns: ColDef[] = [
		{ field: "component", headerName: i18n._(t`Component`) },
		{ field: "id", headerName: i18n._(t`Vulnerability`) },
		{
			field: "severity",
			headerName: i18n._(t`Severity`),
			children: SeverityChip,
			orderMap: severityOrderMap,
		},
		{
			field: "hasHiddenFindings",
			headerName: i18n._(t`Actions`),
			children: HiddenFindingCell,
			disableRowClick: true,
			bodyStyle: {
				maxWidth: "5rem",
				width: "5rem",
			},
		},
	];
	let rows: RowDef[] = [];

	for (const [component, vulns] of Object.entries(
		scan.results?.vulnerabilities ?? {}
	)) {
		for (const [id, details] of Object.entries(vulns ?? {})) {
			let hasRaw = false;

			// multiple matching hidden findings (1 for each source file)
			const findings = hiddenFindings.filter((hf) => {
				return (
					(hf.type === "vulnerability" &&
						hf.value.component === component &&
						hf.value.id === id) ||
					(hf.type === "vulnerability_raw" && hf.value.id === id)
				);
			});
			let unhiddenFindings: string[] = [];
			if (findings.length > 0) {
				hasRaw = findings.some((h) => h.type === "vulnerability_raw");
				if (!hasRaw) {
					unhiddenFindings = [...details.source];
					for (const hf of findings) {
						if (hf.type === "vulnerability" && unhiddenFindings.length > 0) {
							const i = unhiddenFindings.indexOf(hf.value.source);
							if (i > -1) {
								unhiddenFindings.splice(i, 1);
							}
						}
					}
				}
			}
			// note: only data passed in the row object will be accessible in the cell's render function ("children" ColDef field)
			// this is why fields such as url and createdBy are added here
			rows.push({
				keyId: [
					hasRaw ? "vulnerability_raw" : "vulnerability",
					component,
					id,
					details.severity,
				].join("-"),
				type: hasRaw ? "vulnerability_raw" : "vulnerability",
				url: scan.service + "/" + scan.repo,
				createdBy: currentUser.email,
				// hidden finding data stored in "hiddenFindings" field
				// boolean "hasHiddenFindings" used for column definition bc boolean provides for column sortability
				hasHiddenFindings: Boolean(findings.length),
				hiddenFindings: findings.length ? findings : undefined,
				unhiddenFindings,
				component,
				id,
				severity: details.severity,
				source: details.source,
				description: details.description,
				remediation: details.remediation ?? "",
			});
		}
	}

	const onRowSelect = (row: RowDef | null) => {
		setSelectedRow(row);
		setSelectedRowNum(null);
		if (row) {
			const rowId = rows.findIndex((r) => {
				return r?.keyId === row?.keyId;
			});
			if (rowId !== -1) {
				setSelectedRowNum(rowId);
			}
		}
	};

	const handleOnClear = (field: string) => {
		const newFilters = { ...filters };
		newFilters[field].filter = "";
		setFilters(newFilters);
	};

	const clearAllFilters = () => {
		setFilters((prevState: FilterDef) => {
			const newFilters = { ...prevState };
			for (const field in prevState) {
				newFilters[field].filter = "";
			}
			return newFilters;
		});
	};

	const handleOnChange = (field: string, value: string) => {
		setFilters((prevState: FilterDef) => {
			const newFilters = { ...prevState };
			newFilters[field].filter = value;
			return newFilters;
		});
	};

	return (
		<>
			{rows.length ? (
				<>
					<Box className={classes.showFilters}>
						<Box className={classes.tableDescription} displayPrint="none">
							<Box component="span" m={1}>
								<FilterField
									field="component"
									autoFocus={true}
									label={i18n._(t`Component`)}
									value={filters["component"].filter}
									onClear={handleOnClear}
									onChange={handleOnChange}
								/>
							</Box>
							<Box component="span" m={1}>
								<FilterField
									field="id"
									label={i18n._(t`Vulnerability`)}
									value={filters["id"].filter}
									onClear={handleOnClear}
									onChange={handleOnChange}
								/>
							</Box>
							<Box component="span" m={1}>
								<SeverityFilterField
									value={filters["severity"].filter}
									onChange={handleOnChange}
									summary={scan?.results_summary?.vulnerabilities}
								/>
							</Box>
							<Box component="span" m={1}>
								<Zoom
									in={Object.values(filters).some((value) => value.filter)}
									unmountOnExit
								>
									<Fab
										aria-label={i18n._(t`Clear all filters`)}
										color="primary"
										size="small"
										onClick={clearAllFilters}
									>
										<ClearIcon fontSize="small" />
									</Fab>
								</Zoom>
							</Box>
						</Box>
						<Divider />
					</Box>

					<EnhancedTable
						columns={columns}
						rows={rows}
						defaultOrderBy="severity"
						onRowSelect={onRowSelect}
						selectedRow={selectedRow}
						filters={filters}
					/>
					<DraggableDialog
						open={!!selectedRow}
						title={dialogTitle()}
						copyTitle={true}
						maxWidth="md"
						fullWidth={true}
					>
						{vulnDialogContent()}
					</DraggableDialog>
					<HiddenFindingDialog
						row={hideRowNum !== null ? rows[hideRowNum] : null}
						open={hideRowNum !== null}
						onClose={() => {
							setHideRowNum(null);
						}}
					/>
				</>
			) : (
				<NoResults title={i18n._(t`No vulnerabilities found`)} />
			)}
		</>
	);
};

export const SourceCodeHotLink = (props: {
	row: RowDef | null;
	addTitle?: boolean;
}) => {
	const { i18n } = useLingui();
	const { row, addTitle } = props;

	let link = <></>;
	let url = null;
	if (row) {
		url = vcsHotLink(row);
	}
	// note: use i18n instead of <Trans> element for tooltip title
	// otherwise, a11y can't determine the title properly
	let text = addTitle ? (
		<Trans>View in Version Control</Trans>
	) : (
		i18n._(t`View in Version Control`)
	);

	if (url) {
		if (addTitle) {
			link = (
				<Box>
					<Button
						startIcon={<OpenInNewIcon />}
						href={url}
						target="_blank"
						rel="noopener noreferrer nofollow"
						size="small"
					>
						{text}
					</Button>
				</Box>
			);
		} else {
			link = (
				<Box>
					<Tooltip title={text}>
						<span>
							<Button
								endIcon={<OpenInNewIcon />}
								href={url}
								target="_blank"
								rel="noopener noreferrer nofollow"
								size="small"
							></Button>
						</span>
					</Tooltip>
				</Box>
			);
		}
	} else {
		link = <></>;
	}
	return link;
};

export const AnalysisTabContent = (props: {
	scan: AnalysisReport;
	hiddenFindings: HiddenFinding[];
	currentUser: User;
}) => {
	const { classes } = useStyles();
	const { i18n } = useLingui();
	const { scan, hiddenFindings, currentUser } = props;
	const [selectedRow, setSelectedRow] = useState<RowDef | null>(null);
	const [selectedRowNum, setSelectedRowNum] = useState<number | null>(null);
	const [hideRowNum, setHideRowNum] = useState<number | null>(null);
	const [filters, setFilters] = useState<FilterDef>({
		filename: {
			filter: "",
		},
		resource: {
			filter: "",
		},
		severity: {
			filter: "",
		},
	});

	const columns: ColDef[] = [
		{ field: "filename", headerName: i18n._(t`File`) },
		{ field: "line", headerName: i18n._(t`Line`) },
		{ field: "resource", headerName: i18n._(t`Type`) },
		{
			field: "severity",
			headerName: i18n._(t`Severity`),
			children: SeverityChip,
			orderMap: severityOrderMap,
		},
		{
			field: "hasHiddenFindings",
			headerName: i18n._(t`Actions`),
			children: HiddenFindingCell,
			disableRowClick: true,
			bodyStyle: {
				maxWidth: "5rem",
				width: "5rem",
			},
		},
	];

	let rows: RowDef[] = [];

	for (const [filename, items] of Object.entries(
		scan.results?.static_analysis ?? {}
	)) {
		items.forEach((item: AnalysisFinding) => {
			// single matching hidden finding
			const findings = hiddenFindings.find((hf) => {
				return (
					hf.type === "static_analysis" &&
					hf.value.filename === filename &&
					hf.value.line === item.line &&
					hf.value.type === item.type
				);
			});
			// note: only data passed in the row object will be accessible in the cell's render function ("children" ColDef field)
			// this is why fields such as url and createdBy are added here
			rows.push({
				keyId: [
					"static_analysis",
					filename,
					item.line,
					item.type,
					item.severity,
					item.message,
				].join("-"),
				type: "static_analysis",
				url: scan.service + "/" + scan.repo,
				createdBy: currentUser.email,
				// hidden finding data stored in "hiddenFindings" field
				// boolean "hasHiddenFindings" used for column definition bc boolean provides for column sortability
				hasHiddenFindings: Boolean(findings),
				hiddenFindings: findings ? [findings] : undefined,
				filename,
				line: item.line,
				resource: item.type,
				message: item.message,
				severity: item.severity,
				repo: scan.repo,
				service: scan.service,
				branch: scan.branch,
			});
		});
	}

	const analysisDialogContent = () => {
		return (
			<>
				<DialogContent dividers={true}>
					<span>
						<SeverityChip value={selectedRow?.severity} />
					</span>
					<Grid container spacing={3}>
						{/* left column */}
						<Grid item xs={6} className={classes.tabDialogGrid}>
							<List>
								{/* TODO: consider making long individual list items scroll instead of scrolling all dialog content */}
								<ListItem key="analysis-source">
									<ListItemText
										primary={
											<>
												{i18n._(t`Found in Source File:`)}
												{selectedRow?.filename && selectedRow?.line && (
													<CustomCopyToClipboard
														copyTarget={`${selectedRow.filename} (Line ${selectedRow.line})`}
													/>
												)}
											</>
										}
										secondary={
											<>
												<span>
													<Trans>
														{selectedRow?.filename ?? ""} (Line{" "}
														{selectedRow?.line}){" "}
													</Trans>
												</span>
												<SourceCodeHotLink row={selectedRow} addTitle={true} />
											</>
										}
									/>
								</ListItem>
							</List>
						</Grid>

						{/* right column */}
						<Grid item xs={6}>
							<List>
								<ListItem key="analysis-details">
									<ListItemText
										primary={
											<>
												{i18n._(t`Details`)}
												{selectedRow?.message && (
													<CustomCopyToClipboard
														copyTarget={selectedRow?.message}
													/>
												)}
											</>
										}
										secondary={selectedRow?.message ?? ""}
									/>
								</ListItem>
							</List>
						</Grid>
					</Grid>
				</DialogContent>
				<FindingDialogActions
					row={selectedRow}
					onClose={() => onRowSelect(null)}
					onFindingHidden={() => {
						setHideRowNum(selectedRowNum);
					}}
				/>
			</>
		);
	};

	const onRowSelect = (row: RowDef | null) => {
		setSelectedRow(row);
		setSelectedRowNum(null);
		if (row) {
			const rowId = rows.findIndex((r) => {
				return r?.keyId === row?.keyId;
			});
			if (rowId !== -1) {
				setSelectedRowNum(rowId);
			}
		}
	};

	const handleOnClear = (field: string) => {
		const newFilters = { ...filters };
		newFilters[field].filter = "";
		setFilters(newFilters);
	};

	const clearAllFilters = () => {
		setFilters((prevState: FilterDef) => {
			const newFilters = { ...prevState };
			for (const field in prevState) {
				newFilters[field].filter = "";
			}
			return newFilters;
		});
	};

	const handleOnChange = (field: string, value: string) => {
		setFilters((prevState: FilterDef) => {
			const newFilters = { ...prevState };
			newFilters[field].filter = value;
			return newFilters;
		});
	};

	return (
		<>
			{rows.length ? (
				<>
					<Box className={classes.showFilters}>
						<Box className={classes.tableDescription} displayPrint="none">
							<Box component="span" m={1}>
								<FilterField
									field="filename"
									autoFocus={true}
									label={i18n._(t`File`)}
									value={filters["filename"].filter}
									onClear={handleOnClear}
									onChange={handleOnChange}
								/>
							</Box>
							<Box component="span" m={1}>
								<FilterField
									field="resource"
									label={i18n._(t`Type`)}
									value={filters["resource"].filter}
									onClear={handleOnClear}
									onChange={handleOnChange}
								/>
							</Box>
							<Box component="span" m={1}>
								<SeverityFilterField
									value={filters["severity"].filter}
									onChange={handleOnChange}
									summary={scan?.results_summary?.static_analysis}
								/>
							</Box>
							<Box component="span" m={1}>
								<Zoom
									in={Object.values(filters).some((value) => value.filter)}
									unmountOnExit
								>
									<Fab
										aria-label={i18n._(t`Clear all filters`)}
										color="primary"
										size="small"
										onClick={clearAllFilters}
									>
										<ClearIcon fontSize="small" />
									</Fab>
								</Zoom>
							</Box>
						</Box>
						<Divider />
					</Box>

					<EnhancedTable
						columns={columns}
						rows={rows}
						defaultOrderBy="severity"
						onRowSelect={onRowSelect}
						selectedRow={selectedRow}
						filters={filters}
					/>
					<DraggableDialog
						open={!!selectedRow}
						onClose={() => onRowSelect(null)}
						title={
							selectedRow?.resource && typeof selectedRow.resource === "string"
								? capitalize(selectedRow.resource)
								: i18n._(t`No Type`)
						}
						copyTitle={true}
						maxWidth={"md"}
						fullWidth={true}
					>
						{analysisDialogContent()}
					</DraggableDialog>
					<HiddenFindingDialog
						row={hideRowNum !== null ? rows[hideRowNum] : null}
						open={hideRowNum !== null}
						onClose={() => {
							setHideRowNum(null);
						}}
					/>
				</>
			) : (
				<NoResults title={i18n._(t`No static analysis findings`)} />
			)}
		</>
	);
};

export const SecretsTabContent = (props: {
	scan: AnalysisReport;
	hiddenFindings: HiddenFinding[];
	currentUser: User;
}) => {
	const { classes } = useStyles();
	const { i18n } = useLingui();
	const { scan, hiddenFindings, currentUser } = props;
	const [selectedRow, setSelectedRow] = useState<RowDef | null>(null);
	const [selectedRowNum, setSelectedRowNum] = useState<number | null>(null);
	const [hideRowNum, setHideRowNum] = useState<number | null>(null);
	const [filters, setFilters] = useState<FilterDef>({
		filename: {
			filter: "",
		},
		resource: {
			filter: "",
		},
		commit: {
			filter: "",
		},
	});

	const columns: ColDef[] = [
		{ field: "filename", headerName: i18n._(t`File`) },
		{ field: "line", headerName: i18n._(t`Line`) },
		{ field: "resource", headerName: i18n._(t`Type`) },
		{ field: "commit", headerName: i18n._(t`Commit`) },
		{
			field: "hasHiddenFindings",
			headerName: i18n._(t`Actions`),
			children: HiddenFindingCell,
			disableRowClick: true,
			bodyStyle: {
				maxWidth: "5rem",
				width: "5rem",
			},
		},
	];
	let rows: RowDef[] = [];

	for (const [filename, items] of Object.entries(scan.results?.secrets ?? {})) {
		items.forEach((item: SecretFinding) => {
			// single matching hidden finding
			const findings = hiddenFindings.find((hf) => {
				return (
					hf.type === "secret" &&
					hf.value.filename === filename &&
					hf.value.line === item.line &&
					hf.value.commit === item.commit
				);
			});
			// note: only data passed in the row object will be accessible in the cell's render function ("children" ColDef field)
			// this is why fields such as url and createdBy are added here
			rows.push({
				keyId: ["secret", filename, item.line, item.type, item.commit].join(
					"-"
				),
				type: "secret",
				url: scan.service + "/" + scan.repo,
				createdBy: currentUser.email,
				// hidden finding data stored in "hiddenFindings" field
				// boolean "hasHiddenFindings" used for column definition bc boolean provides for column sortability
				hasHiddenFindings: Boolean(findings),
				hiddenFindings: findings ? [findings] : undefined,
				filename,
				line: item.line,
				resource: item.type,
				commit: item.commit,
				repo: scan.repo,
				service: scan.service,
				branch: scan.branch,
			});
		});
	}

	const secretDialogContent = () => {
		return (
			<>
				<DialogContent dividers={true}>
					<Grid container spacing={3}>
						{/* left column */}
						<Grid item xs={6} className={classes.tabDialogGrid}>
							<List>
								{/* TODO: consider making long individual list items scroll instead of scrolling all dialog content */}
								<ListItem key="secret-source">
									<ListItemText
										primary={
											<>
												{i18n._(t`Found in Source File:`)}
												{selectedRow?.filename && selectedRow?.line && (
													<CustomCopyToClipboard
														copyTarget={`${selectedRow.filename} (Line ${selectedRow.line})`}
													/>
												)}
											</>
										}
										secondary={
											<>
												<span>
													<Trans>
														{selectedRow?.filename ?? ""} (Line{" "}
														{selectedRow?.line})
													</Trans>
												</span>
												<SourceCodeHotLink row={selectedRow} addTitle={true} />
											</>
										}
									/>
								</ListItem>
							</List>
						</Grid>

						{/* right column */}
						<Grid item xs={6}>
							<List>
								<ListItem key="secret-commit">
									<ListItemText
										primary={
											<>
												{i18n._(t`Commit`)}
												{selectedRow?.commit && (
													<CustomCopyToClipboard
														copyTarget={selectedRow.commit}
													/>
												)}
											</>
										}
										secondary={selectedRow?.commit ?? ""}
									/>
								</ListItem>
							</List>
						</Grid>
					</Grid>
				</DialogContent>
				<FindingDialogActions
					row={selectedRow}
					onClose={() => onRowSelect(null)}
					onFindingHidden={() => {
						setHideRowNum(selectedRowNum);
					}}
				/>
			</>
		);
	};

	const onRowSelect = (row: RowDef | null) => {
		setSelectedRow(row);
		setSelectedRowNum(null);
		if (row) {
			const rowId = rows.findIndex((r) => {
				return r?.keyId === row?.keyId;
			});
			if (rowId !== -1) {
				setSelectedRowNum(rowId);
			}
		}
	};

	const handleOnClear = (field: string) => {
		const newFilters = { ...filters };
		newFilters[field].filter = "";
		setFilters(newFilters);
	};

	const clearAllFilters = () => {
		setFilters((prevState: FilterDef) => {
			const newFilters = { ...prevState };
			for (const field in prevState) {
				newFilters[field].filter = "";
			}
			return newFilters;
		});
	};

	const handleOnChange = (field: string, value: string) => {
		setFilters((prevState: FilterDef) => {
			const newFilters = { ...prevState };
			newFilters[field].filter = value;
			return newFilters;
		});
	};

	return (
		<>
			{rows.length ? (
				<>
					<Box className={classes.showFilters}>
						<Box className={classes.tableDescription} displayPrint="none">
							<Box component="span" m={1}>
								<FilterField
									field="filename"
									autoFocus={true}
									label={i18n._(t`File`)}
									value={filters["filename"].filter}
									onClear={handleOnClear}
									onChange={handleOnChange}
								/>
							</Box>
							<Box component="span" m={1}>
								<FilterField
									field="resource"
									label={i18n._(t`Type`)}
									value={filters["resource"].filter}
									onClear={handleOnClear}
									onChange={handleOnChange}
								/>
							</Box>
							<Box component="span" m={1}>
								<FilterField
									field="commit"
									label={i18n._(t`Commit`)}
									value={filters["commit"].filter}
									onClear={handleOnClear}
									onChange={handleOnChange}
								/>
							</Box>
							<Box component="span" m={1}>
								<Zoom
									in={Object.values(filters).some((value) => value.filter)}
									unmountOnExit
								>
									<Fab
										aria-label={i18n._(t`Clear all filters`)}
										color="primary"
										size="small"
										onClick={clearAllFilters}
									>
										<ClearIcon fontSize="small" />
									</Fab>
								</Zoom>
							</Box>
						</Box>
						<Divider />
					</Box>

					<EnhancedTable
						columns={columns}
						rows={rows}
						defaultOrderBy="type"
						onRowSelect={onRowSelect}
						selectedRow={selectedRow}
						filters={filters}
					/>
					<DraggableDialog
						open={!!selectedRow}
						onClose={() => onRowSelect(null)}
						title={
							selectedRow?.resource && typeof selectedRow.resource === "string"
								? capitalize(selectedRow.resource)
								: ""
						}
						copyTitle={true}
						maxWidth={"md"}
						fullWidth={true}
					>
						{secretDialogContent()}
					</DraggableDialog>
					<HiddenFindingDialog
						row={hideRowNum !== null ? rows[hideRowNum] : null}
						open={hideRowNum !== null}
						onClose={() => {
							setHideRowNum(null);
						}}
					/>
				</>
			) : (
				<NoResults title={i18n._(t`No secrets found`)} />
			)}
		</>
	);
};

const InventoryTabContent = (props: {
	scan: AnalysisReport;
	sharedColors: string[];
}) => {
	const { classes, cx } = useStyles();
	const { i18n } = useLingui();
	const { scan, sharedColors } = props;

	const columns: ColDef[] = [
		{ field: "image", headerName: i18n._(t`Image`) },
		{ field: "tag", headerName: i18n._(t`Tag`) },
	];
	let rows: RowDef[] = [];

	for (const [image, items] of Object.entries(
		scan.results?.inventory?.base_images ?? {}
	)) {
		items?.tags.forEach((tag: string) => {
			rows.push({
				keyId: ["image", image, tag].join("-"),
				image,
				tag,
			});
		});
	}

	interface TechData {
		name: string;
		value: number;
	}

	let techData: TechData[] = [];
	for (const [name, value] of Object.entries(
		scan.results?.inventory?.technology_discovery ?? {}
	)) {
		techData.push({
			name,
			value,
		});
	}
	// sort technology discovery by % discovered descending
	// also ensures pie graph orders slices by size
	techData.sort((a, b) => {
		return b.value - a.value;
	});

	const renderLabel = (entry: any) => {
		return `${entry.name} (${entry.value}%)`;
	};

	return (
		<>
			<Paper square className={classes.paper}>
				<Toolbar>
					<Typography variant="h6" id="inventory-title" component="div">
						<Trans>Technology</Trans>
						<CustomCopyToClipboard
							copyTarget={techData
								.map((data) => {
									// format tech inventory results
									return `${data.name} - ${data.value}%`;
								})
								.join(", ")}
						/>
					</Typography>
				</Toolbar>
				{scan.results?.inventory?.technology_discovery ? (
					<Card>
						<CardContent>
							<div className={classes.techChartContainer}>
								<ResponsiveContainer width="100%" height={350}>
									<PieChart>
										<Pie
											data={techData}
											cx="50%"
											cy="50%"
											innerRadius="60%"
											outerRadius="80%"
											fill="#82ca9d"
											label={renderLabel}
											nameKey="name"
											dataKey="value"
											paddingAngle={2}
											minAngle={4}
											isAnimationActive={false}
										>
											{/* label displays technology count in center of pie chart torus */}
											<Label
												className={cx(
													classes.pieInnerLabel,
													"MuiTypography-h4"
												)}
												value={
													scan.results_summary?.inventory
														?.technology_discovery ?? 0
												}
												position="center"
											/>

											{
												/* pie chart slices */
												// eg [{'name': 'Java', 'value': 66.77},{},{},...]
												techData.map((entry, i) => (
													<Cell
														key={`cell-${i}`}
														fill={sharedColors[i % sharedColors.length]}
													/>
												))
											}
										</Pie>

										{/* legend to left of pie chart with items listed vertically */}
										<Legend
											layout="vertical"
											iconType="circle"
											wrapperStyle={{ top: 0, left: 25, maxHeight: 10 }}
											formatter={(value, entry, index) => {
												// recharts LegendPayload includes a payload object that is not in the type description
												// overriding type checking here but ensuring existence before use
												// @ts-ignore
												if (entry && entry.payload && entry.payload.value) {
													// @ts-ignore
													return `${value} (${entry.payload.value}%)`;
												}
												return value;
											}}
										/>
									</PieChart>
								</ResponsiveContainer>
							</div>
						</CardContent>
					</Card>
				) : (
					<NoResults title={i18n._(t`No technologies found`)} />
				)}
			</Paper>
			<Paper square className={classes.paper}>
				<Toolbar>
					<Typography variant="h6" id="base-images-title" component="div">
						<Trans>Base Images</Trans>
						{rows && (
							<CustomCopyToClipboard
								copyTarget={rows
									.map((data) => {
										// format base image results
										return `${data.image} - ${data.tag}`;
									})
									.join(", ")}
							/>
						)}
					</Typography>
				</Toolbar>
				{scan.results?.inventory?.base_images ? (
					<EnhancedTable columns={columns} rows={rows} defaultOrderBy="image" />
				) : (
					<NoResults title={i18n._(t`No base images found`)} />
				)}
			</Paper>
		</>
	);
};

interface AllStylesT {
	[key: string]: { [key: string]: React.CSSProperties };
}

const CodeTabContent = (props: { scan: AnalysisReport }) => {
	const { classes } = useStyles();
	const { i18n } = useLingui();
	const theme = useTheme();
	// set default code style theme based on light/dark mode
	const [style, setStyle] = useState(
		theme.palette.mode === "dark" ? "materialDark" : "materialLight"
	);
	const allStyles: AllStylesT = {
		a11yDark: { ...a11yDark },
		atomDark: { ...atomDark },
		coy: { ...coy },
		dracula: { ...dracula },
		materialDark: { ...materialDark },
		materialLight: { ...materialLight },
		materialOceanic: { ...materialOceanic },
		nord: { ...nord },
		okaidia: { ...okaidia },
		prism: { ...prism },
		solarizedlight: { ...solarizedlight },
		vs: { ...vs },
	};
	const [showLineNumbers, setShowLineNumbers] = useState(false);
	const [wrapLongLines, setWrapLongLines] = useState(false);
	const { scan } = props;

	const handleStyleChange = (event: SelectChangeEvent<string>) => {
		setStyle(event.target.value);
	};

	return (
		<>
			<FormGroup row className={classes.rawToolbar}>
				<FormControl variant="outlined" className={classes.formControl}>
					<InputLabel id="theme-select-label">
						<Trans>Theme</Trans>
					</InputLabel>
					{/* not using Formik fields here as its overkill for just an unvalidated immediate-change selector */}
					<MuiSelect
						labelId="theme-select-label"
						id="theme-select"
						autoFocus
						value={style}
						onChange={handleStyleChange}
					>
						<MenuItem value="a11yDark">
							a11yDark <Trans>(dark)</Trans>
						</MenuItem>
						<MenuItem value="atomDark">
							atomDark <Trans>(dark)</Trans>
						</MenuItem>
						<MenuItem value="coy">
							coy <Trans>(light)</Trans>
						</MenuItem>
						<MenuItem value="dracula">
							dracula <Trans>(dark)</Trans>
						</MenuItem>
						<MenuItem value="materialDark">
							materialDark <Trans>(dark)</Trans>
						</MenuItem>
						<MenuItem value="materialLight">
							materialLight <Trans>(light)</Trans>
						</MenuItem>
						<MenuItem value="materialOceanic">
							materialOceanic <Trans>(dark)</Trans>
						</MenuItem>
						<MenuItem value="nord">
							nord <Trans>(dark)</Trans>
						</MenuItem>
						<MenuItem value="okaidia">
							okaidia <Trans>(dark)</Trans>
						</MenuItem>
						<MenuItem value="prism">
							prism <Trans>(light)</Trans>
						</MenuItem>
						<MenuItem value="solarizedlight">
							solarizedLight <Trans>(light)</Trans>
						</MenuItem>
						<MenuItem value="vs">
							vs <Trans>(light)</Trans>
						</MenuItem>
					</MuiSelect>
				</FormControl>

				<FormControlLabel
					control={
						<Checkbox
							checked={showLineNumbers}
							onChange={() => {
								setShowLineNumbers(!showLineNumbers);
							}}
							name="showLineNumbers"
						/>
					}
					label={i18n._(t`Show line numbers`)}
				/>
				<FormControlLabel
					control={
						<Checkbox
							checked={wrapLongLines}
							onChange={() => {
								setWrapLongLines(!wrapLongLines);
							}}
							name="wrapLongLines"
						/>
					}
					label={i18n._(t`Wrap long lines`)}
				/>

				<CustomCopyToClipboard size="medium" copyTarget={scan} />
			</FormGroup>

			<SyntaxHighlighter
				language="json"
				style={allStyles[style]}
				showLineNumbers={showLineNumbers}
				wrapLongLines={wrapLongLines}
			>
				{JSON.stringify(scan, null, 2)}
			</SyntaxHighlighter>
		</>
	);
};

interface HiddenFindingsSummary extends SeverityLevels {
	secret: number;
	secret_raw: number;
	static_analysis: number;
	vulnerability: number;
	vulnerability_raw: number;
}

export const HiddenFindingsTabContent = (props: {
	hiddenFindingsConsolidatedRows: RowDef[];
	hiddenFindingsSummary: HiddenFindingsSummary;
}) => {
	const { i18n } = useLingui();
	const { classes, cx } = useStyles();
	const dispatch: AppDispatch = useDispatch();
	const { hiddenFindingsConsolidatedRows, hiddenFindingsSummary } = props;
	const [selectedRow, setSelectedRow] = useState<RowDef | null>(null);
	const [filters, setFilters] = useState<FilterDef>({
		type: {
			filter: "",
			match: "exact",
		},
		source: {
			filter: "",
		},
		location: {
			filter: "",
		},
		component: {
			filter: "",
		},
		severity: {
			filter: "",
		},
	});

	const onRowSelect = (row: RowDef | null) => {
		// reset finding load state to idle so dialog stays open (refer to HiddenFindingDialog useEffect auto-close)
		dispatch(resetStatus());
		setSelectedRow(row);
	};

	const columns: ColDef[] = [
		{
			field: "type",
			headerName: i18n._(t`Category`),
			children: FindingTypeChip,
		},
		{
			field: "source",
			headerName: i18n._(t`File`),
			children: SourceCell,
			bodyStyle: {
				maxWidth: "20rem", // add limits to source file width, otherwise CVE and/or expiration may wrap
				width: "20rem",
				overflowWrap: "break-word",
			},
		},
		{
			field: "location",
			headerName: i18n._(t`Id/Line`),
			children: TooltipCell,
			bodyStyle: {
				maxWidth: "10rem", // add limits to source file width, otherwise CVE and/or expiration may wrap
				width: "10rem",
				minWidth: "10rem",
				overflowWrap: "anywhere",
				textOverflow: "ellipsis",
				whiteSpace: "nowrap",
				overflow: "hidden",
			},
		},
		{
			field: "component",
			headerName: i18n._(t`Component/Commit`),
			children: TooltipCell,
		},
		{
			field: "severity",
			headerName: i18n._(t`Severity`),
			children: SeverityChip,
			orderMap: severityOrderMap,
		},
		{
			field: "expires",
			headerName: i18n._(t`Expires`),
			children: ExpiringDateTimeCell,
			bodyStyle: {
				maxWidth: "110rem", // add limits to source file width, otherwise CVE and/or expiration may wrap
				width: "110rem",
				whiteSpace: "nowrap",
			},
		},
	];

	const handleOnClear = (field: string) => {
		const newFilters = { ...filters };
		newFilters[field].filter = "";
		setFilters(newFilters);
	};

	const clearAllFilters = () => {
		setFilters((prevState: FilterDef) => {
			const newFilters = { ...prevState };
			for (const field in prevState) {
				newFilters[field].filter = "";
			}
			return newFilters;
		});
	};

	const handleOnChange = (field: string, value: string) => {
		setFilters((prevState: FilterDef) => {
			const newFilters = { ...prevState };
			newFilters[field].filter = value;
			return newFilters;
		});
	};

	return (
		<>
			{hiddenFindingsConsolidatedRows.length ? (
				<>
					<Box className={classes.tableInfo}>
						<Box>
							<Chip
								label={i18n._(
									t`These findings will be excluded from all results for this repository, including all branches`
								)}
								icon={<InfoIcon />}
							/>
						</Box>
					</Box>
					<Box
						className={cx(classes.tableDescription, classes.showFilters)}
						displayPrint="none"
					>
						<Box component="span" m={1}>
							<MuiTextField
								select
								id="filter-type"
								name="filter-type"
								label={i18n._(t`Category`)}
								variant="outlined"
								autoFocus={true}
								value={filters["type"].filter}
								size="small"
								className={classes.selectFilter}
								onChange={(event) => {
									handleOnChange("type", event.target.value);
								}}
								InputProps={{
									className: classes.filterField,
									startAdornment: (
										<InputAdornment position="start">
											<FilterListIcon />
										</InputAdornment>
									),
								}}
							>
								<MenuItem value="">
									<i>
										<Trans>None</Trans>
									</i>
								</MenuItem>
								<MenuItem value="secret">
									<FindingTypeChip
										value="secret"
										count={hiddenFindingsSummary.secret}
									/>
								</MenuItem>
								<MenuItem value="secret_raw">
									<FindingTypeChip
										value="secret_raw"
										count={hiddenFindingsSummary.secret_raw}
									/>
								</MenuItem>
								<MenuItem value="static_analysis">
									<FindingTypeChip
										value="static_analysis"
										count={hiddenFindingsSummary.static_analysis}
									/>
								</MenuItem>
								<MenuItem value="vulnerability">
									<FindingTypeChip
										value="vulnerability"
										count={hiddenFindingsSummary.vulnerability}
									/>
								</MenuItem>
								<MenuItem value="vulnerability_raw">
									<FindingTypeChip
										value="vulnerability_raw"
										count={hiddenFindingsSummary.vulnerability_raw}
									/>
								</MenuItem>
							</MuiTextField>
						</Box>
						<Box component="span" m={1}>
							<FilterField
								field="source"
								label={i18n._(t`File`)}
								value={filters["source"].filter}
								onClear={handleOnClear}
								onChange={handleOnChange}
							/>
						</Box>
						<Box component="span" m={1}>
							<FilterField
								field="location"
								label={i18n._(t`Id/Line`)}
								value={filters["location"].filter}
								onClear={handleOnClear}
								onChange={handleOnChange}
							/>
						</Box>
						<Box component="span" m={1}>
							<FilterField
								field="component"
								label={i18n._(t`Component/Commit`)}
								value={filters["component"].filter}
								onClear={handleOnClear}
								onChange={handleOnChange}
							/>
						</Box>
						<Box component="span" m={1}>
							<SeverityFilterField
								value={filters["severity"].filter}
								onChange={handleOnChange}
								summary={hiddenFindingsSummary}
							/>
						</Box>
						<Box component="span" m={1}>
							<Zoom
								in={Object.values(filters).some((value) => value.filter)}
								unmountOnExit
							>
								<Fab
									aria-label={i18n._(t`Clear all filters`)}
									color="primary"
									size="small"
									onClick={clearAllFilters}
								>
									<ClearIcon fontSize="small" />
								</Fab>
							</Zoom>
						</Box>
					</Box>
					<Divider />

					<EnhancedTable
						columns={columns}
						rows={hiddenFindingsConsolidatedRows}
						defaultOrderBy="type"
						onRowSelect={onRowSelect}
						selectedRow={selectedRow}
						filters={filters}
					/>
					<HiddenFindingDialog
						open={!!selectedRow}
						onClose={() => onRowSelect(null)}
						row={selectedRow}
					/>
				</>
			) : (
				<NoResults title={i18n._(t`No hidden findings`)} />
			)}
		</>
	);
};

interface ResultsScan {
	service?: string;
	org?: string;
	repo: string;
	id: string;
	tab?: number;
}

interface ScanOptionsProps {
	scan: AnalysisReport;
}

export const ScanOptionsSummary = (props: ScanOptionsProps) => {
	const { classes } = useStyles();
	const { i18n } = useLingui();
	const theme = useTheme();
	const { scan } = props;
	const [accordionExpanded, setAccordionExpanded] = useState(false);

	const categories =
		scan?.scan_options.categories ??
		([
			"-vulnerability",
			"-secret",
			"-static_analysis",
			"-inventory",
		] as ScanCategories[]);

	const getPluginChip = (label: string) => {
		const disabled = label.startsWith("-");
		const plugin = disabled ? label.slice(1) : label;
		const pluginName =
			plugin in pluginKeys && pluginKeys[plugin]?.displayName
				? pluginKeys[plugin].displayName
				: capitalize(plugin);

		return (
			<Chip
				className={classes.chipPlugins}
				disabled={disabled}
				key={label}
				label={<Trans>{pluginName}</Trans>}
				size="small"
				variant={disabled ? "outlined" : "filled"}
			/>
		);
	};

	const getCategoryChip = (apiCategory: ScanCategories) => {
		const getChip = (translatedLabel: string) => {
			return (
				<Chip
					className={classes.chipPlugins}
					key={translatedLabel}
					label={translatedLabel}
					size="small"
				/>
			);
		};

		const getChipDisabledChip = (translatedLabel: string) => {
			return (
				<Chip
					className={classes.chipPlugins}
					disabled
					key={translatedLabel}
					label={translatedLabel}
					size="small"
					variant="outlined"
				/>
			);
		};

		switch (apiCategory) {
			case "-vulnerability":
				return getChipDisabledChip(i18n._(t`Vulnerability`));

			case "vulnerability":
				return getChip(i18n._(t`Vulnerability`));

			case "-secret":
				return getChipDisabledChip(i18n._(t`Secret`));

			case "secret":
				return getChip(i18n._(t`Secret`));

			case "-static_analysis":
				return getChipDisabledChip(i18n._(t`Static Analysis`));

			case "static_analysis":
				return getChip(i18n._(t`Static Analysis`));

			case "-inventory":
				return getChipDisabledChip(i18n._(t`Inventory`));

			case "inventory":
				return getChip(i18n._(t`Inventory`));
		}
	};

	const pluginsList = scan?.scan_options?.plugins?.slice() || [];
	pluginsList.sort(compareButIgnoreLeadingDashes);

	const categoryChips: React.ReactNode[] = categories.map((cat) =>
		getCategoryChip(cat)
	);

	const pluginChips: React.ReactNode[] | undefined = pluginsList?.map(
		(plugin) => getPluginChip(plugin)
	);

	function parseDashAsNotRun(str: string) {
		if (str.startsWith("-")) {
			let newStr = str.slice(1) + " (not run)";
			return newStr;
		}
		return str;
	}

	const categoriesTooltip = categories.map((cat) =>
		capitalize(parseDashAsNotRun(cat))
	);
	const pluginsListTooltip = pluginsList.map((plug) =>
		capitalize(parseDashAsNotRun(plug))
	);

	return (
		<Accordion
			expanded={accordionExpanded}
			onChange={() => {
				setAccordionExpanded(!accordionExpanded);
			}}
		>
			<AccordionSummary
				expandIcon={
					<Box displayPrint="none">
						<ExpandMoreIcon />
					</Box>
				}
				aria-controls="scan-options-section-content"
				id="scan-options-section-header"
			>
				<TuneIcon style={{ marginRight: theme.spacing(2) }} />
				<Typography className={classes.heading}>
					<Trans>Scan Options</Trans>
				</Typography>
			</AccordionSummary>

			<Divider />

			<AccordionDetails className={classes.accordionDetails}>
				<Grid container spacing={3}>
					<Grid item xs={6}>
						<List dense={true}>
							<ListItem key="scan-options-categories">
								<ListItemIcon>
									<CategoryIcon />
								</ListItemIcon>
								<Tooltip describeChild title={categoriesTooltip.join(", ")}>
									<ListItemText
										primary={i18n._(t`Categories`)}
										secondary={categoryChips}
									/>
								</Tooltip>
							</ListItem>
							<ListItem key="scan-options-plugins">
								<ListItemIcon>
									<ExtensionIcon />
								</ListItemIcon>
								<Tooltip describeChild title={pluginsListTooltip.join(", ")}>
									<ListItemText
										primary={i18n._(t`Plugins`)}
										secondary={
											pluginChips?.length ? pluginChips : i18n._(t`None`)
										}
									/>
								</Tooltip>
							</ListItem>
							<ListItem key="scan-options-depth">
								<ListItemIcon>
									<HistoryIcon />
								</ListItemIcon>
								<Tooltip describeChild title={scan?.scan_options?.depth ?? ""}>
									<ListItemText
										primary={i18n._(t`Commit History`)}
										secondary={scan?.scan_options?.depth ?? ""}
									/>
								</Tooltip>
							</ListItem>
						</List>
					</Grid>
					<Grid item xs={6}>
						<List dense={true}>
							<ListItem key="scan-options-include-dev">
								<ListItemIcon>
									<CodeIcon />
								</ListItemIcon>
								<Tooltip
									describeChild
									title={
										scan?.scan_options?.include_dev
											? i18n._(t`Yes`)
											: i18n._(t`No`)
									}
								>
									<ListItemText
										classes={{ secondary: classes.listItemText }}
										primary={i18n._(t`Scan Developer Dependencies`)}
										secondary={
											scan?.scan_options?.include_dev
												? i18n._(t`Yes`)
												: i18n._(t`No`)
										}
									/>
								</Tooltip>
							</ListItem>
							<ListItem key="scan-options-batch-priority">
								<ListItemIcon>
									<QueueIcon />
								</ListItemIcon>
								<Tooltip
									describeChild
									title={
										scan?.scan_options?.batch_priority
											? i18n._(t`Yes`)
											: i18n._(t`No`)
									}
								>
									<ListItemText
										classes={{ secondary: classes.listItemText }}
										primary={i18n._(t`Batch Priority`)}
										secondary={
											scan?.scan_options?.batch_priority
												? i18n._(t`Yes`)
												: i18n._(t`No`)
										}
									/>
								</Tooltip>
							</ListItem>
						</List>
					</Grid>
				</Grid>
			</AccordionDetails>
		</Accordion>
	);
};

interface ResultsSummaryProps {
	scan: AnalysisReport;
}

// displayEnd - boolean, whether to display the endTime
// defaults to false, display the startTime
function elapsedTime(
	startTime?: string,
	endTime?: string,
	displayEnd?: boolean
) {
	const dt = formatDate((displayEnd ? endTime : startTime) || "", "long");
	const elapsed = DateTime.fromISO(endTime || DateTime.now().toString())
		.diff(DateTime.fromISO(startTime || DateTime.now().toString()))
		.toFormat("hh:mm:ss");
	return (
		<Trans>
			{dt} / {elapsed} Elapsed
		</Trans>
	);
}

export const ResultsSummary = (props: ResultsSummaryProps) => {
	const { classes } = useStyles();
	const { i18n } = useLingui();
	const { scan } = props;

	let resultsIcon = <AssignmentLateIcon className={classes.resultsError} />;
	let resultsChip = (
		<Chip
			size="small"
			variant="outlined"
			className={classes.resultsError}
			label={i18n._(t`Issues Found`)}
		></Chip>
	);
	if (scan?.success) {
		resultsIcon = <AssignmentTurnedInIcon className={classes.resultsSuccess} />;
		resultsChip = (
			<Chip
				size="small"
				variant="outlined"
				className={classes.resultsSuccess}
				label={i18n._(t`No Issues Found`)}
			></Chip>
		);
	}

	return (
		<Paper className={classes.paper}>
			<Typography
				component="h2"
				variant="h6"
				align="center"
				className={classes.paperHeader}
			>
				<Trans>Scan Results</Trans>
				<CustomCopyToClipboard
					icon="share"
					size="small"
					copyTarget={window.location.href}
					copyLabel={i18n._(t`Copy link to these scan results`)}
				/>
			</Typography>

			<Grid container spacing={3}>
				{/* left column */}
				<Grid item xs={4}>
					<List dense={true}>
						<ListItem key="scan-repo">
							<ListItemIcon>
								<FolderIcon />
							</ListItemIcon>
							<Tooltip describeChild title={scan?.repo || ""}>
								<ListItemText
									classes={{ secondary: classes.listItemText }}
									primary={i18n._(t`Organization / Repository`)}
									secondary={scan?.repo}
								/>
							</Tooltip>
						</ListItem>
						<ListItemMetaMultiField data={scan} includeIcon={true} />
						<ResultsMetaField data={scan} />
						<ListItem key="scan-service">
							<ListItemIcon>
								<CloudIcon />
							</ListItemIcon>
							<Tooltip describeChild title={scan?.service || ""}>
								<ListItemText
									classes={{ secondary: classes.listItemText }}
									primary={i18n._(t`Service`)}
									secondary={scan?.service}
								/>
							</Tooltip>
						</ListItem>
						<ListItem key="scan-branch">
							<ListItemIcon>
								<AccountTreeIcon />
							</ListItemIcon>
							<Tooltip describeChild title={scan?.branch || i18n._(t`Default`)}>
								<ListItemText
									classes={{ secondary: classes.listItemText }}
									primary={i18n._(t`Branch`)}
									secondary={
										scan?.branch || (
											<i>
												<Trans>Default</Trans>
											</i>
										)
									}
								/>
							</Tooltip>
						</ListItem>
					</List>
				</Grid>

				{/* middle column */}
				<Grid item xs={4}>
					<List dense={true}>
						<ListItem key="scan-initiated-by">
							<ListItemIcon>
								<PersonIcon />
							</ListItemIcon>
							<Box className={classes.listItemText}>
								<ListItemText
									classes={{ secondary: classes.listItemText }}
									primary={i18n._(t`Initiated By`)}
									secondary={
										scan?.initiated_by ? (
											<MailToLink
												recipient={scan.initiated_by}
												text={scan.initiated_by}
												tooltip
											/>
										) : (
											<i>
												<Trans>Not specified</Trans>
											</i>
										)
									}
								/>
							</Box>
						</ListItem>
						<ListItem key="scan-status">
							<ListItemIcon>
								<InfoIcon />
							</ListItemIcon>
							<Tooltip describeChild title={scan?.status || ""}>
								<ListItemText
									classes={{ secondary: classes.listItemText }}
									primary={i18n._(t`Status`)}
									secondary={scan?.status ? capitalize(scan?.status) : ""}
								/>
							</Tooltip>
						</ListItem>

						<ListItem key="scan-success">
							<ListItemIcon>{resultsIcon}</ListItemIcon>
							<Tooltip
								describeChild
								title={
									scan?.success
										? i18n._(t`No Issues Found`)
										: i18n._(t`Potential Security Issues Found`)
								}
							>
								<ListItemText
									primary={i18n._(t`Results`)}
									secondary={resultsChip}
								/>
							</Tooltip>
						</ListItem>

						<ListItem key="scan-id">
							<ListItemIcon>
								<SecurityIcon />
							</ListItemIcon>
							<Tooltip describeChild title={scan?.scan_id || ""}>
								<ListItemText
									classes={{ secondary: classes.listItemText }}
									primary={i18n._(t`Scan ID`)}
									secondary={scan?.scan_id}
								/>
							</Tooltip>
						</ListItem>
					</List>
				</Grid>

				{/* right column */}
				<Grid item xs={4}>
					<List dense={true}>
						<ListItem key="scan-time-queued">
							<ListItemIcon>
								<WatchLaterIcon />
							</ListItemIcon>
							<Tooltip
								describeChild
								title={elapsedTime(
									scan?.timestamps?.queued || undefined,
									scan?.timestamps?.start || DateTime.now().toString()
								)}
							>
								<ListItemText
									classes={{ secondary: classes.listItemTextWrapped }}
									primary={i18n._(t`Queued Date / Queued Time Elapsed`)}
									secondary={elapsedTime(
										scan?.timestamps?.queued || undefined,
										scan?.timestamps?.start || DateTime.now().toString()
									)}
								/>
							</Tooltip>
						</ListItem>
						<ListItem key="scan-time-start">
							<ListItemIcon>
								<WatchLaterIcon />
							</ListItemIcon>
							<Tooltip
								describeChild
								title={formatDate(scan?.timestamps?.start || "", "long")}
							>
								<ListItemText
									classes={{ secondary: classes.listItemText }}
									primary={i18n._(t`Start Date`)}
									secondary={formatDate(scan?.timestamps?.start || "", "long")}
								/>
							</Tooltip>
						</ListItem>
						<ListItem key="scan-time-end">
							<ListItemIcon>
								<WatchLaterIcon />
							</ListItemIcon>
							<Tooltip
								describeChild
								title={elapsedTime(
									scan?.timestamps?.start || undefined,
									scan?.timestamps?.end || DateTime.now().toString(),
									true
								)}
							>
								<ListItemText
									classes={{ secondary: classes.listItemTextWrapped }}
									primary={i18n._(t`End Date / Scan Time Elapsed`)}
									secondary={elapsedTime(
										scan?.timestamps?.start || undefined,
										scan?.timestamps?.end || DateTime.now().toString(),
										true
									)}
								/>
							</Tooltip>
						</ListItem>
					</List>
				</Grid>
			</Grid>

			<ScanOptionsSummary scan={scan} />
		</Paper>
	);
};

export const TabContent = (props: {
	activeTab: number;
	onTabChange: Function;
	scan: AnalysisReport;
	hiddenFindings: HiddenFinding[];
	currentUser: User;
	sharedColors: string[];
}) => {
	const { classes } = useStyles();
	const { i18n } = useLingui();
	const {
		activeTab,
		scan,
		hiddenFindings,
		currentUser,
		sharedColors,
		onTabChange,
	} = props;

	const getTotalCounts = () => {
		let imageCount = scan?.results_summary?.inventory?.base_images ?? 0;
		let techCount = scan?.results_summary?.inventory?.technology_discovery ?? 0;
		return {
			secrets: scan?.results_summary?.secrets ?? 0,
			inventory: imageCount || techCount ? `${techCount}/${imageCount}` : 0,
			// sum the key totals
			vulnerabilities: scan?.results_summary?.vulnerabilities
				? Object.values(scan.results_summary.vulnerabilities).reduce(
						(a, b) => a + b
				  )
				: 0,
			staticAnalysis: scan?.results_summary?.static_analysis
				? Object.values(scan.results_summary.static_analysis).reduce(
						(a, b) => a + b
				  )
				: 0,
		};
	};

	const [counts] = useState(getTotalCounts());
	const [hiddenFindingsConsolidatedRows, setHiddenFindingsConsolidatedRows] =
		useState<RowDef[]>([]);
	const [hiddenFindingsSummary, setHiddenFindingsSummary] =
		useState<HiddenFindingsSummary>({
			critical: 0,
			high: 0,
			medium: 0,
			low: 0,
			negligible: 0,
			"": 0,
			secret: 0,
			secret_raw: 0,
			static_analysis: 0,
			vulnerability: 0,
			vulnerability_raw: 0,
		});

	// calculate hiddenFinding count
	// rollup vulnerability findings with only differing source files into single finding
	// to match other areas in results
	useEffect(() => {
		let rows: RowDef[] = [];
		let summary = {
			critical: 0,
			high: 0,
			medium: 0,
			low: 0,
			negligible: 0,
			"": 0,
			secret: 0,
			secret_raw: 0,
			static_analysis: 0,
			vulnerability: 0,
			vulnerability_raw: 0,
		};

		hiddenFindings.forEach((item: HiddenFinding) => {
			// common fields for all types
			let row: any = {
				keyId: ["hiddenFinding", item.id].join("-"),
				url: scan.service + "/" + scan.repo,
				createdBy: currentUser.email,
				type: item.type,
				// set items without an expiration to "Never" instead of ""
				// so they sort (asc) oldest => newest => never using cell strcmp
				expires: item.expires ?? i18n._(t`Never`),
				repo: scan.repo,
				service: scan.service,
				branch: scan.branch,
			};
			let unhiddenFindings: string[] = [];

			switch (item.type) {
				case "static_analysis":
					row = {
						...row,
						source: item.value.filename,
						filename: item.value.filename,
						location: item.value.line,
						component: item.value.type,
						severity: item.value?.severity ?? "",
						hiddenFindings: [{ ...item }],
						unhiddenFindings,
					};
					rows.push(row);
					summary.static_analysis += 1;
					if (item.value?.severity && item.value.severity in summary) {
						summary[item.value.severity] += 1;
					}
					break;

				case "secret":
					row = {
						...row,
						source: item.value.filename,
						filename: item.value.filename,
						location: item.value.line,
						component: item.value.commit,
						severity: "", // default to "" instead of null so it sorts correctly among other severities
						hiddenFindings: [{ ...item }],
						unhiddenFindings,
					};
					rows.push(row);
					summary.secret += 1;
					break;

				case "secret_raw":
					row = {
						...row,
						source: i18n._(t`Any`),
						location: item.value.value,
						component: i18n._(t`Any`),
						severity: "",
						hiddenFindings: [{ ...item }],
						unhiddenFindings,
					};
					rows.push(row);
					summary.secret_raw += 1;
					break;

				// combine vuln findings with same id & component, this matches how these would be hidden in the vulns tab
				case "vulnerability":
					const rowMatch = rows.find((er) => {
						if (
							er.type === "vulnerability" &&
							er.location === item.value.id &&
							er.component === item.value.component
						) {
							return true;
						}
						return false;
					});
					if (rowMatch && Array.isArray(rowMatch.source)) {
						rowMatch.source.push(item.value.source);
						rowMatch.hiddenFindings.push({ ...item });
						rowMatch.unhiddenFindings = rowMatch.unhiddenFindings.filter(
							(src: string) => src !== item.value.source
						);
					} else {
						// source files associated with this component/vuln that are not already covered by this hidden finding
						if (
							scan?.results?.vulnerabilities &&
							item.value.component in scan.results.vulnerabilities
						) {
							if (
								item.value.id in
								scan.results.vulnerabilities[item.value.component]
							) {
								unhiddenFindings = scan.results.vulnerabilities[
									item.value.component
								][item.value.id].source.filter(
									(src: string) => src !== item.value.source
								);
							}
						}
						row = {
							...row,
							source: [item.value.source],
							location: item.value.id,
							component: item.value.component,
							severity: item.value?.severity ?? "",
							hiddenFindings: [{ ...item }],
							unhiddenFindings,
						};
						rows.push(row);
						summary.vulnerability += 1;
						if (item.value?.severity && item.value.severity in summary) {
							summary[item.value.severity] += 1;
						}
					}
					break;

				case "vulnerability_raw":
					row = {
						...row,
						source: i18n._(t`Any`),
						location: item.value.id,
						component: i18n._(t`Any`),
						severity: item.value?.severity ?? "",
						hiddenFindings: [{ ...item }],
						unhiddenFindings,
					};
					rows.push(row);
					summary.vulnerability_raw += 1;
					if (item.value?.severity && item.value.severity in summary) {
						summary[item.value.severity] += 1;
					}
					break;
			}
		});

		setHiddenFindingsConsolidatedRows(rows);
		setHiddenFindingsSummary(summary);
	}, [hiddenFindings, scan, currentUser.email, i18n]);

	const handleTabChange = (event: React.ChangeEvent<{}>, newValue: number) => {
		onTabChange(newValue);
	};

	// This is so the overview chart can change the current tab
	const tabChanger = (n: number) => onTabChange(n);

	// When tabs are disabled, then OverviewCards should not be clickable links to those tabs
	const isDisabledVulns = !scan?.results_summary?.vulnerabilities;
	const isDisabledStat = !scan?.results_summary?.static_analysis;
	const isDisabledSecrets = typeof scan?.results_summary?.secrets !== "number";
	const isDisabledInventory = !scan?.results_summary?.inventory;
	const isDisabledHFs = false; // always available to allowlist a new hidden finding

	return (
		<Paper>
			<Paper square>
				<Tabs
					value={activeTab}
					indicatorColor="primary"
					textColor="primary"
					onChange={handleTabChange}
					aria-label={i18n._(t`Report Sections Tabs`)}
					variant="fullWidth"
				>
					<Tab
						className={classes.tab}
						label={i18n._(t`Overview`)}
						icon={<AssessmentIcon />}
						{...a11yProps(0)}
					/>
					<Tab
						className={classes.tab}
						label={i18n._(t`Vulnerabilities`)}
						icon={
							<StyledBadge
								badgeContent={counts.vulnerabilities}
								max={999}
								color="primary"
							>
								<SecurityIcon />
							</StyledBadge>
						}
						{...a11yProps(1)}
						disabled={isDisabledVulns}
					/>
					<Tab
						className={classes.tab}
						label={i18n._(t`Static Analysis`)}
						icon={
							<StyledBadge
								badgeContent={counts.staticAnalysis}
								max={999}
								color="primary"
							>
								<BugReportIcon />
							</StyledBadge>
						}
						{...a11yProps(2)}
						disabled={isDisabledStat}
					/>
					<Tab
						className={classes.tab}
						label={i18n._(t`Secrets`)}
						icon={
							<StyledBadge
								badgeContent={counts.secrets}
								max={999}
								color="primary"
							>
								<VpnKeyIcon />
							</StyledBadge>
						}
						{...a11yProps(3)}
						disabled={isDisabledSecrets}
					/>
					<Tab
						className={classes.tab}
						label={i18n._(t`Inventory`)}
						icon={
							<StyledBadge
								badgeContent={counts.inventory}
								max={999}
								color="primary"
							>
								<LayersIcon />
							</StyledBadge>
						}
						{...a11yProps(4)}
						disabled={isDisabledInventory}
					/>
					<Tab
						className={classes.tab}
						label={i18n._(t`Raw`)}
						icon={<CodeIcon />}
						{...a11yProps(5)}
					/>
					<Tab
						className={classes.tab}
						label={i18n._(t`Hidden Findings`)}
						icon={
							<StyledBadge
								badgeContent={hiddenFindingsConsolidatedRows.length}
								max={999}
								color="primary"
							>
								<VisibilityOffIcon />
							</StyledBadge>
						}
						{...a11yProps(6)}
					/>
				</Tabs>
			</Paper>

			<TabPanel value={activeTab} index={0}>
				<OverviewTabContent
					scan={scan}
					hfRows={hiddenFindingsConsolidatedRows}
					tabChanger={tabChanger}
					sharedColors={sharedColors}
					tabsStatus={{
						isDisabledVulns,
						isDisabledStat,
						isDisabledSecrets,
						isDisabledInventory,
						isDisabledHFs,
					}}
				/>
			</TabPanel>
			<TabPanel value={activeTab} index={1}>
				<VulnTabContent
					scan={scan}
					hiddenFindings={hiddenFindings}
					currentUser={currentUser}
				/>
			</TabPanel>
			<TabPanel value={activeTab} index={2}>
				<AnalysisTabContent
					scan={scan}
					hiddenFindings={hiddenFindings}
					currentUser={currentUser}
				/>
			</TabPanel>
			<TabPanel value={activeTab} index={3}>
				<SecretsTabContent
					scan={scan}
					hiddenFindings={hiddenFindings}
					currentUser={currentUser}
				/>
			</TabPanel>
			<TabPanel value={activeTab} index={4}>
				<InventoryTabContent scan={scan} sharedColors={sharedColors} />
			</TabPanel>
			<TabPanel value={activeTab} index={5}>
				<CodeTabContent scan={scan} />
			</TabPanel>
			<TabPanel value={activeTab} index={6}>
				<HiddenFindingsTabContent
					hiddenFindingsConsolidatedRows={hiddenFindingsConsolidatedRows}
					hiddenFindingsSummary={hiddenFindingsSummary}
				/>
			</TabPanel>
		</Paper>
	);
};

interface CustomLocation extends Path {
	state: ScanFormLocationState; // defaults to unknown
	key: Key;
}

const ResultsPage = () => {
	const { classes } = useStyles();
	const { i18n } = useLingui();
	const theme = useTheme();
	const dispatch: AppDispatch = useDispatch();
	const navigate = useNavigate(); // only for navigation, e.g. replace(), push(), goBack()
	const location = useLocation() as CustomLocation; // for location, since history.location is mutable
	const [id, setId] = useState<string | null>(null);
	const [activeTab, setActiveTab] = useState(0);
	const [initialFindingCount, setInitialFindingCount] = useState<number | null>(
		null
	);
	const hiddenFindings = useSelector((state: RootState) =>
		selectAllHiddenFindings(state)
	);
	const hiddenFindingsTotal = useSelector(selectTotalHiddenFindings);
	const scansStatus = useSelector((state: RootState) => state.scans.status);
	const scan = useSelector((state: RootState) =>
		selectScanById(state, id || -1)
	);

	const currentUser = useSelector((state: RootState) =>
		selectCurrentUser(state, "self")
	); // current user is "self" id
	const usersStatus = useSelector(
		(state: RootState) => state.currentUser.status
	);
	const [sharedColors, setSharedColors] = useState<string[]>([]);

	const resultsScanSchema = Yup.object().shape(
		{
			org: Yup.string()
				.trim()
				.when("service", {
					is: (service: string) => service && service.length > 0,
					then: Yup.string(),
					otherwise: Yup.string().required(i18n._(t`Service or org required`)),
				})
				.oneOf(currentUser?.scan_orgs ?? [], i18n._(t`Invalid value`)),
			service: Yup.string()
				.trim()
				.when("org", {
					is: (org: string) => org && org.length > 0,
					then: Yup.string(),
					otherwise: Yup.string().required(i18n._(t`Service or org required`)),
				})
				.test(
					"userScanOrg",
					i18n._(t`User does not have access to this service`),
					(value, context) => {
						if (context?.parent?.org) {
							return true;
						}
						if (value && currentUser?.scan_orgs) {
							for (let i = 0; i < currentUser.scan_orgs.length; i += 1) {
								if (currentUser.scan_orgs[i].startsWith(value)) {
									return true;
								}
							}
						}
						return false;
					}
				),
			repo: Yup.string()
				.trim()
				.required()
				.matches(/^[a-zA-Z0-9.\-_/]+$/)
				.when("org", {
					// if org does not contain /Org suffix, then repo must contain Org/ Prefix
					is: (org: string) => org && !org.includes("/"),
					then: Yup.string().matches(/\//),
				}),
			id: Yup.string()
				.defined()
				.length(36)
				.matches(
					/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
				), // UUID
			tab: Yup.number().min(0).max(6).integer(),
		},
		[["org", "service"]]
	);

	// get report params from passed-in URL query params and validate matches schema
	// returns null if no hash params or validation fails
	const getSearchParams = (): ResultsScan | null => {
		if (location.search) {
			const search = QueryString.parse(location.search);
			if (Object.keys(search)) {
				try {
					// schema validation will also transform query params to their correct types
					const validValues = resultsScanSchema.validateSync(search, {
						strict: false, // setting to false will trim fields on validate
					});
					if (
						validValues?.repo &&
						validValues?.id &&
						(validValues?.org || validValues?.service)
					) {
						return validValues;
					}
					return null;
				} catch (err) {
					return null;
				}
			}
		}
		return null;
	};

	const onTabChange = (tab: number) => {
		setActiveTab(tab);

		// add new tab id to url search query string
		if (location.search) {
			let search = QueryString.parse(location.search);
			if (Object.keys(search)) {
				search["tab"] = String(tab);
				navigate(location.pathname + "?" + QueryString.stringify(search), {
					state: location?.state,
					replace: true,
				});
			}
		}
	};

	useEffect(() => {
		document.title = i18n._(t`Artemis - Scan Results`);
	}, [i18n]);

	// initial page load
	useEffect(() => {
		// because we are using a SPA router, opening a report will not automatically scroll to top of page
		// so do this manually when report is first viewed
		if (currentUser && currentUser.scan_orgs && currentUser.scan_orgs.length) {
			window.scrollTo(0, 0);

			const searchParams = getSearchParams();
			if (searchParams) {
				setId(searchParams.id);
				const repoUrl = [
					searchParams.org ?? searchParams.service,
					searchParams.repo,
				].join("/");
				const scanUrl = [repoUrl, searchParams.id].join("/");
				dispatch(
					getScanById({
						url: scanUrl,
						meta: {
							filters: {
								format: { match: "exact", filter: "full" },
							}, // get full results
						},
					})
				);

				// clear stale hidden findings (could be for a different repo)
				dispatch(clearHiddenFindings());

				// get any hidden findings for the repo
				dispatch(
					getHiddenFindings({
						url: repoUrl,
					})
				);
			}
		}

		// run as currentUser changes,
		// getting loaded async to validate vcsOrg option passed in URL
		// are valid for current user

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentUser]);

	useEffect(() => {
		if (initialFindingCount === null) {
			setInitialFindingCount(hiddenFindingsTotal);
		}
	}, [hiddenFindingsTotal, initialFindingCount]);

	useEffect(() => {
		if (
			currentUser &&
			currentUser.scan_orgs &&
			currentUser.scan_orgs.length &&
			scan &&
			// full scan results have been fetched
			Object.keys(scan?.results ?? {}).length > 0
		) {
			// add repo & branch name to page title now that we have that info from the loaded scan data
			document.title = scan?.branch
				? i18n._(t`Artemis - Scan Results: ${scan?.repo} (${scan.branch})`)
				: i18n._(t`Artemis - Scan Results: ${scan?.repo} (default)`);

			const searchParams = getSearchParams();
			if (searchParams?.tab) {
				let tab = searchParams.tab;
				// don't activate a disabled tab (category that wasn't run)
				// instead, redirect to overview tab
				if (
					(tab === 1 && !scan?.results_summary?.vulnerabilities) ||
					(tab === 2 && !scan?.results_summary?.static_analysis) ||
					(tab === 3 && typeof scan?.results_summary?.secrets !== "number") ||
					(tab === 4 && !scan?.results_summary?.inventory)
				) {
					tab = 0;
				}
				setActiveTab(tab);
			}

			// scan still running
			if (
				scan.status === "queued" ||
				scan.status === "processing" ||
				scan.status.startsWith("running ")
			) {
				dispatch(
					addNotification(
						i18n._(t`Scan in progress, results subject to change`),
						"info"
					)
				);
			}
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentUser, scan]);

	useEffect(() => {
		function generateChartColors(count: number) {
			let colors: string[] = [];

			const shades =
				theme.palette.mode === "dark"
					? ["100", "200"] // how light or dark to make pie chart segment colors
					: ["400", "500"];
			for (let i = 0; i < count; i += 1) {
				let color = randomMC.getColor({ shades: shades });
				// don't reuse an existing selected color
				while (colors.indexOf(color) !== -1) {
					color = randomMC.getColor({ shades: shades });
				}
				colors.push(color);
			}

			return colors;
		}

		const numberOfColors = 25; // beyond approx 35, generating colors becomes an infinite loop, there must be a limited number of material ui colors available.
		setSharedColors(generateChartColors(numberOfColors));
	}, [theme.palette.mode]);

	const ErrorContent = () => (
		<Container className={classes.alertContainer}>
			<Alert variant="outlined" severity="error" className={classes.alert}>
				<AlertTitle>
					<Trans>Error</Trans>
				</AlertTitle>
				<Trans>Results for the specified scan can not be found.</Trans>
			</Alert>
		</Container>
	);

	const LoadingContent = () => (
		<Container className={classes.alertContainer}>
			<Alert variant="outlined" severity="info" className={classes.alert}>
				<AlertTitle>
					<Trans>Please wait</Trans>
				</AlertTitle>
				<Trans>Fetching scan results...</Trans>
			</Alert>
		</Container>
	);

	const BackButton = () => {
		const handBackButton = (event: React.SyntheticEvent) => {
			event.preventDefault();

			if (location?.state?.fromScanForm && window.history.length > 2) {
				// user modified hidden findings while viewing scan results
				// clear the scan cache so hidden finding changes will be applied to new scan results
				// that will be fetched when navigating back to viewing scans on main page
				if (initialFindingCount !== hiddenFindingsTotal) {
					dispatch(clearScans());
				}
				// navigated here from scans form, so return to it
				navigate(-1);
			} else {
				// navigated directly here (such as via URL), force nav to scans page
				navigate("/");
			}
		};

		return (
			<Button
				autoFocus
				startIcon={<ArrowBackIosIcon />}
				onClick={handBackButton}
			>
				<Trans>Back to Scans</Trans>
			</Button>
		);
	};

	return (
		<Container>
			<Box displayPrint="none" className={classes.navButtons}>
				<BackButton />

				<Button
					startIcon={
						<AutorenewIcon
							className={scansStatus === "loading" ? classes.refreshSpin : ""}
						/>
					}
					disabled={!scan || scansStatus === "loading"}
					onClick={() => {
						dispatch(
							getScanById({
								url: [scan?.service, scan?.repo, scan?.scan_id].join("/"),
								meta: {
									filters: {
										format: { match: "exact", filter: "full" },
									}, // get full results
								},
							})
						);
					}}
				>
					<Trans>Refresh Scan Results</Trans>
				</Button>
			</Box>

			{scansStatus === "loading" || usersStatus === "loading" ? (
				<LoadingContent />
			) : scan && currentUser ? (
				<>
					<ResultsSummary scan={scan} />
					<TabContent
						activeTab={activeTab}
						onTabChange={onTabChange}
						scan={scan}
						hiddenFindings={hiddenFindings}
						currentUser={currentUser}
						sharedColors={sharedColors}
					/>
				</>
			) : (
				<ErrorContent />
			)}
		</Container>
	);
};
export default ResultsPage;
