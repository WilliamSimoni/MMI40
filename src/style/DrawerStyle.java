package style;

public class DrawerStyle extends StyleValue {
	String position; /* Indica la posizione da cui compare il Drawer. Puo
	assumere i valori right,left,top,bottom.*/
	boolean fixed; /* se true, quando il drawer viene chiuso vengono mostrati gli
	elementi puntati da headerClosed e listClosed. Se headerClosed e
	listClosed non sono deniti, xed e obbligatoriamente false. In tal
	caso, il drawer, quando chiuso, scompare del tutto.*/
	Color color; // Indica il colore del background del Drawer.

}
