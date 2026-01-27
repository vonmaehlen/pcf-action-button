import { IInputs, IOutputs } from "./generated/ManifestTypes";
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { initializeIcons } from '@fluentui/font-icons-mdl2';
import ButtonControl, { IButtonControlProps } from "./ButtonControl";
import { ActionButton } from "./interfaces";

type IControlContext = ComponentFramework.Context<IInputs>;

export class QuickActionButton implements ComponentFramework.StandardControl<IInputs, IOutputs> {
	private container: HTMLDivElement;
	private buttonClicked: string;
	private notifyOutputChanged: () => void;

    constructor() {
		initializeIcons();
	}

	public init(context: IControlContext, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container: HTMLDivElement): void {
		this.container = container;
		this.notifyOutputChanged = notifyOutputChanged;
	}

	public updateView(context: IControlContext): void {
		this.renderControl(context);
	}

	private renderControl(context: IControlContext): void {
		const params = context.parameters;
		const userSettings = context.userSettings.languageId;

		// Buttons JSON comes from a bound attribute.
		// Empty or invalid values are handled defensively.
		let rawButtons = params.Buttons.raw ?? "";
		if (!rawButtons.trim()) {
			rawButtons = "[]";
		}

		let buttons: ActionButton[] = [];
		try {
			buttons = JSON.parse(rawButtons);
		} catch {
			// If the JSON in the attribute is invalid, we simply render no buttons.
			buttons = [];
		}

		const buttonsWithTranslations = buttons.map((button: ActionButton) => {
			return {
				...button,
				label: button.translations[userSettings] || button.translations["1033"] || "",
			}
		});
		
		const props: IButtonControlProps = {
			buttons: buttonsWithTranslations,
			buttonType: params.ButtonType.raw ?? "",
			isFormDisabled: context.mode.isControlDisabled,
			onButtonClicked: this.onActionClicked
		}

		ReactDOM.render(React.createElement(ButtonControl, props), this.container);
	}

	private onActionClicked = (key: string) => {
		this.buttonClicked = key;
		this.notifyOutputChanged()
	}

	public getOutputs(): IOutputs {
		return { 
			LinkedAttribute: this.buttonClicked 
		};
	}

	public destroy(): void {
	}
}