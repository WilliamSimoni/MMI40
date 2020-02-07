package style;

public class TextStyle extends StyleValue {
	String fontSize; /* dimensione dei caratteri. E' possibile indicare i valori
	xx-small, x-small, small, medium, large, x-large, xx-large o
	un numero.*/
	String fontWeight; /* Indica lo spessore dei caratteri del testo. E' possibile
	indicare i valori bold e normal.*/
	Color color;// Colore del testo.
	String alignment; /* come viene allineato il testo. Puo assumere i valori
	center, left, right e justify*/
	String textDecoration; /* utilizzato per nascondere le decorazioni associando
	il valore none, o per aggiungere delle descrizioni
	(overline,line-through,underline).*/
	float letterSpacing; // indica la distanza in pixel tra i caratteri.
	float wordSpacing; // indica la distanza in pixel tra le parole.
	float  lineHeight; // distanza tra una linea e la successiva.
	String direction; //direzione del testo. Puo assumere i valori rtl o ltr.
}
