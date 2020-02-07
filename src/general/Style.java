package general;

import style.StyleValue;

public class Style {
	
	String id;
	Class<?> type;
	StyleValue value;

	public Style(String id,Class<?> type,StyleValue value) {
		this.id=id;
		this.type=type;
		this.value=value;
	}
}
