package style;

public class RowStyle extends StyleValue {

	String direction; /* Stringa che indica la direzione in cui mostrare gli
	elementi. Puo assumere due valori, reverse o forward. Se il valore e
	forward, gli elementi vengono mostrati dall'alto verso il basso,
	viceversa il contrario. */
		String mainAxisAlignment; /*Stringa che indica il posizionamento degli
	elementi sull'asse principale. Puo assumere i valori center
	(posizionamento al centro), start (posizionamento in alto), end
	(posizionamento in basso), spaceEven (elementi equidistanti),
	baseline (allineamento lungo la baseline), spaceBetween e
	spaceAround. */
		 String crossAxisAlignment; /* Stringa che indica il posizionamento sull'asse
	perpendicolare. Puo assumere li stessi valori di MainAxisAlignment.*/
		 
		 float mainAxisSize; /* dimensione dell'asse principale. Di default cerca di
	occupare tutto lo spazio disponibile.*/
		 
		 float crossAxisSize; /* dimensione dell'asse perpendicolare. Di default cerca di
	occupare tutto lo spazio disponibile.*/
}
