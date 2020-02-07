package conversational;

import java.util.ArrayList;
import java.util.List;

import general.Element;
import general.IdGenerator;
import general.Props;

public class Utterances extends Element {
	
	Props utterances;

	public Utterances(String id) {
		super(id);
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(Intent.class);
		this.utterances=new Props(IdGenerator.getNextIdProps(), type, true, true, -1);
		this.props.put("utterances",utterances);
	}

}
