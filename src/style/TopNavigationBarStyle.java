package style;

public class TopNavigationBarStyle extends StyleValue {
	
	public String backgroundColor;// colore di background della barra di navigazione.
	public float  height; // Larghezza della barra.
	public String alignment; /* Stringa che indica il posizionamento orizzontale degli
	elementi nella navbar. Puo assumere i valori center
	(posizionamento al centro), start (posizionamento a sinistra), end
	(posizionamento a destra), spaceEven (elementi equidistanti),
	baseline (allineamento lungo la baseline), spaceBetween e
	spaceAround.*/
	public boolean fixed; /* Booleano. Se false, quando avviene lo scroll verso il basso la
	barra scompare. Se true, la barra rimane sempre nella sua posizione.*/

}
