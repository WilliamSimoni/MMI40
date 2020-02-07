package style;

public class ContainerStyle extends StyleValue {
	
	Color backgroundColor;
	Color borderColor;
	boolean pixel;//indica se i dati sono pixel(true) o percentuali(false)
	float borderWidth;
	float maxWidth;// massima larghezza del fglio del Container.
	float minWidth; // minima larghezza del fglio del Container.
	float maxHeight; //massima altezza del glio del Container.
	float minHeight; // minima altezza del glio del Container.
	float width;// larghezza esatta del container. Rende inutile la denizione di max/min Width.
	float height; // altezza esatta del container. Rende inutile la denizione di max/min Height.
	int paddingTop;
	int paddingRight;
	int paddingLeft;
	int paddingBottom; //il padding applicato al Container in alto. Puo essere
		//espresso sia in termini di pixel che in termini di percentuale.
	int marginTop;
	int marginRight;
	int marginLeft;
	int marginBottom;/* il margine applicato al Container in alto. Puo essere
                   espresso sia in termini di pixel che in termini di percentuale.
	*/
}
